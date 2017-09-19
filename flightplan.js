'use strict';

const join = require('path').join;
const plan = require('flightplan');
const pkg = require('./package.json');
const config = require('./deploy/config.js');
const application = pkg.name;
const deployTo = join(config.prodPath, application);
const repoUrl = pkg.repository.url;
const branch = 'master';
const keepReleases = 3;
const releaseTimestamp = new Date().getTime().toString();
const releasesPath = join(deployTo, 'releases');
const sharedPath = join(deployTo, 'shared');
const repoPath = join(deployTo, 'repo');
const currentPath = join(deployTo, 'current');
const deploymentLogPath = join(deployTo, 'deployments.log');
const releasePath = join(releasesPath, releaseTimestamp);
const linkedDirs = ['node_modules'];

let revision = null;


const deploy = {
  check: (transport) => {
    transport.log('Checking environment...');
    transport.exec('source /etc/profile');
    // 1) Check git is installed
    transport.exec('which git', { silent: true });

    // 2) Check remote repo exists
    transport.exec(`git ls-remote --heads ${repoUrl}`, { silent: true });

    // // 3) Check releases and shared directories exist
    transport.exec(`mkdir -p ${releasesPath} ${sharedPath}`);

    // 4) Check shared directories exist
    if (linkedDirs.length) {
      const dirs = linkedDirs.map(dir => join(sharedPath, dir)).join();
      transport.exec(`mkdir -p ${dirs}`);
    }

    // 5) Check we have a repo
    if (transport.exec(`[ -f ${join(repoPath, 'HEAD')} ]`, { failsafe: true, silent: true }).code === 0) {
      // Yes: Update
      transport.with(`cd ${repoPath}`, () => {
        transport.exec('git remote update', { silent: true });
      });
    } else {
      // No: Clone
      transport.exec(`git clone --mirror ${repoUrl} ${repoPath}`);
    }

    // 6) Check we have write permissions
    // @todo
  },
  createRelease: (transport) => {
    // Create the release
    transport.log('Create release...');

    // 1) Create release folder
    transport.exec(`mkdir -p ${releasePath}`);

    // 2) Bundle repo, copy to release and uncompress contents
    transport.exec(`git -C ${repoPath} archive ${branch} | tar -x -f - -C ${releasePath}`);

    // 3) Create symlinked directories
    if (linkedDirs.length) {
      const dirs = linkedDirs.map(dir => join(releasePath, dir)).join();
      transport.exec(`mkdir -p ${dirs}`);

      linkedDirs.forEach(dir => {
        const target = join(releasePath, dir);
        const source = join(sharedPath, dir);
        if (transport.exec(`[ -d ${target} ]`, { failsafe: true, silent: true }).code === 0) {
          transport.exec(`rm -rf ${target}`);
        }
        transport.exec(`ln -s ${source} ${target}`);
      });
    }

    // 4) Fetch revision number
    transport.with(`cd ${repoPath}`, () => {
      const fetchReleaseSha = transport.exec(`git rev-list --max-count=1 --abbrev-commit --abbrev=12 ${branch}`, { silent: true });

      if (fetchReleaseSha.code === 0) {
        revision = fetchReleaseSha.stdout.trim();
      }
    });

    // 5) Run npm install and build
    transport.with(`cd ${releasePath}; export NODE_ENV=${transport._context.target}`, () => {
      // transport.exec(`npm install --production`, { silent: true })
      transport.exec('yarn install --production', { silent: true });
      // 暂时没用上，去掉
      // transport.exec(`npm run build`, { silent: true })
    });
  },
  publish: (transport) => {
    transport.log('Publishing release...');

    // 1) Update current symlink to new release
    transport.exec(`ln -sfn ${releasePath} ${currentPath}`);

    // 2) Restart node process
    transport.log('Booting application...');
    transport.exec('EGG_SERVER_ENV=prod');
    // transport.exec(`pm2 delete ${application}`);
    transport.exec(`pm2 startOrRestart ${join(currentPath)}/ecosystem.json5 --env production`);

    // transport.with(`cd ${join(currentPath)}`, {silent: true}, function() {
    //     transport.ls('-al'); // 'cd /tmp && ls -al', output suppressed
    //     transport.exec(`pm2 startOrRestart ${join(currentPath)}/ecosystem.json5 --env production`);
    //
    // });

    transport.exec('pwd');
    // transport.exec('pm2 desc account_server');
    //
    // transport.exec('pm2 desc hall_server');
    //
    // transport.exec('pm2 desc majiang_server');
    //
    // transport.exec('pm2 desc dealer_api');


    // transport.exec(`NODE_ENV=production forever restart -c nodejs --spinSleepTime 10000 ${join(currentPath, 'index.js')} || NODE_ENV=production forever start -c nodejs --spinSleepTime 10000 ${join(currentPath, 'index.js')}`, { silent: true })

    // 3) Update log
    transport.exec(`printf "[%s %s] Branch %s (at %s) deployed as release %s by %s\n" $(date '+%Y-%m-%d %H:%M:%S') "${branch}" "${revision}" "${releaseTimestamp}" $(whoami) >> ${deploymentLogPath}`);
  },
  cleanup: (transport) => {
    transport.log('Cleaning up old releases...');

    // 1) Only remove the number of releases specified by keepReleases
    const fetchReleases = transport.exec(`ls -r ${releasesPath}`, { silent: true });
    if (fetchReleases.code === 0) {
      const releases = fetchReleases.stdout.trim().split('\n').slice(keepReleases);
      if (releases.length) {
        transport.log(`Removing ${releases.length} release(s)...`);
        transport.with(`cd ${releasesPath}`, () => transport.exec(`rm -rf ${releases.join(' ')}`));
      }
    }
  }
};

// plan.target('production', envs.production)

// plan.remote('deploy', deploy.check)
// plan.remote('deploy', deploy.createRelease)
// plan.remote('deploy', deploy.publish)
// plan.remote('deploy', deploy.cleanup)
//

function sshFix(transport, host) {
  transport.log('Fixing SSH...');
  // Forcibly add the remote key to known_hosts:
  transport.exec(`ssh-keyscan -t rsa,dsa ${host} 2>&1 | sort -u - ~/.ssh/known_hosts > ~/.ssh/tmp_hosts`);
  transport.exec('mv ~/.ssh/tmp_hosts ~/.ssh/known_hosts');
}

/*
 有几个要提到的要么从dev传递给dev或学习的硬的方式。一旦这样的点是事实，ssh可以有点苛刻，阻止连接时，尝试连接到一个新的主机。ssh将继续等待用户输入，阻止我们美丽的自动部署过程。

 一个小黑客来解决这个问题是在主机上执行一个ssh-键扫描命令，使连接过程不会提示输入：
 */
plan.local(function(local) {
  // SSH-fix all endpoints
  plan.runtime.hosts.forEach(function(endpoint) {
    sshFix(local, endpoint.host);
  });
});

/*
 从ssh的这个问题分支是一个事实，Flightplan在transport方法下使用rsync ，当使用更多的自定义形式的交互与ssh（如我们的键盘骗）时，这可能有复杂的问题。为了解决这个问题，你可以使用自己的传输方法
 */
function transfer(transport, hostInfo, localFile, remoteFile) {
  transport.log(`Transferring package to: ${hostInfo.host}`);
  transport.exec(`scp ${localFile} ${hostInfo.username}@${hostInfo.host}:${remoteFile}`);
}

// targets
plan.target('prod', config.prodHost);
plan.target('dev', config.devHost);

plan.local('git', function(local) {
  // local.log("Copying files...");
  // let filesToCopy = local.exec(`find . -type f -follow -print | grep -v "node_modules"`, {silent: true});
  // console.log(filesToCopy)
  // local.transfer(filesToCopy, "/tmp/deployment/");
  local.log('git push');
  local.exec('git add .');
  local.exec('git commit -m  "abc"');
  local.exec('git push');
});

plan.remote(['deploy'], deploy.check);
plan.remote(['deploy'], deploy.createRelease);
plan.remote(['deploy'], deploy.publish);
plan.remote(['deploy'], deploy.cleanup);


//
// plan.remote(['deploy', 'restart'], function(remote) {
//     remote.log('===========Restart===========');
//     remote.exec('cd ' + srvDir + 'current && ' + nodePath + 'pm2 start start.sh --interpreter bash -n webapp');
// });


plan.remote(['log'], function(remote) {
  remote.log('===========Checking Status===========');
  remote.exec(`pm2 show ${application}`);
  remote.exec('pm2 logs --timestamp "HH:mm:ss"', { exec: { pty: true } });

});

plan.remote(['killlog'], function(remote) {
  remote.log('===========killing Log===========');
  remote.exec('kill $(ps aux | grep \'pm2 logs\' | awk \'{print $2}\')');
});
// run tasks locally

// plan.remote( deploy.check)

// // run tasks remotely
// plan.remote(function(remote) {
//     remote.log("Copying files...");
//     remote.exec("cp -r /tmp/deployment/* /data/leven ");
//     remote.log("Booting application...");
//     remote.exec("pm2 start /data/leven/index.js || pm2 restart /data/leven/index.js");
// });