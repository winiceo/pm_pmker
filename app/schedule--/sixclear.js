'use strict';

module.exports = function() {
  const exports = {};

  const now = new Date();
  const start = (now.getSeconds() + 3) % 60;
  exports.schedule = {
    cron: `0 0 6 * * *`,
    type: 'worker',
  };

  exports.task = function* (ctx) {
     //管理员计数清空
      yield ctx.service.admin.restAdminsCount();
  };
  return exports;
};
