

exports.index = function* (ctx) {
   
  yield ctx.renderClient('app/uc.js', { url: this.url.replace(/\/uc/, '') });
};
