'use strict';

const Utils = require('./utils');
const msg_build_state = 'webpack_build_state';
const msg_build_success = 'webpack_build_success';
const msg_read_file_memory = 'webpack_read_file_memory';
const msg_read_file_memory_content = 'webpack_read_file_memory_content';

const WebpackTool = require('webpack-tool');

class WebpackServer extends WebpackTool {
  constructor(agent, config) {
    super(Object.assign(config, { isServerBuild: true }));
    this.agent = agent;
    this.buildCount = 0;
    this.appPort = this.config.appPort || process.env.PORT || 7001;
    this.compilerCount = this.config.webpackConfigList.length;
  }

  start() {
    const compilers = [];
    this.config.webpackConfigList.forEach((webpackConfig, index) => {
      const compiler = this.build(webpackConfig);
      super.createWebpackServer(compiler, {
        hot: webpackConfig.target !== 'node',
        port: this.config.port + index,
        publicPath: webpackConfig.output.publicPath,
      });
      compilers.push(compiler);
    });
    this.listen(compilers);
  }

  checkBuildState() {
    if (!this.buildState) {
      this.buildState = this.buildCount > 0 && this.buildCount % this.compilerCount === 0;
      if (this.buildState) {
        this.openBrowser(this.appPort);
      }
    }
    return this.buildState;
  }


  build(webpackConfig) {
    return super.build(webpackConfig, () => {
      this.buildCount++;
      const state = this.checkBuildState();
      if (state) {
        this.agent.messenger.sendToApp(msg_build_state, { state });
      }
      this.agent[msg_build_success] = true;
    });
  }

  listen(compilers) {

    this.agent.messenger.on(msg_build_state, () => {
      const state = this.checkBuildState();
      if (state) {
        this.agent.messenger.sendToApp(msg_build_state, { state });
      }
    });

    this.agent.messenger.on(msg_read_file_memory, data => {
      const filePath = data.filePath;
      const fileContent = Utils.readWebpackMemoryFile(compilers, filePath, data.fileName);
      this.agent.messenger.sendToApp(msg_read_file_memory_content, {
        fileContent, filePath
      });
    });
  }
}

module.exports = WebpackServer;
