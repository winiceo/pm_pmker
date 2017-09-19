/**
 * Created by leven on 17/3/1.
 */
module.exports = () => {
  return function* errorHandler(next) {
    try {
      yield next;
    } catch (err) {
            // 注意：自定义的错误统一处理函数捕捉到错误后也要 `app.emit('error', err, this)`
            // 框架会统一监听，并打印对应的错误日志
      this.app.emit('error', err, this);
      this.app.logger.error(err);
            // 自定义错误时异常返回的格式
      this.body = {
        code: 11001,
        message: this.app.config.env === 'prod' ? '操作异常' : err.message,
      };
    }
  };
};
