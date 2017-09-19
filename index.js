
process.env.VUE_ENV = 'server';
// require('egg').startCluster({
//   baseDir: __dirname,
//   workers: process.env.WORKERS,
//   port: process.env.PORT
// });
//

const env = require('./config/environment');

require('egg').startCluster({
    sticky: true,
    baseDir: __dirname,
    port: env.get('app_port') || 6030, // default to 7001,
    workers: 1, // process.env.NODE_ENV === 'development' ? 1 : os.cpus().length

});