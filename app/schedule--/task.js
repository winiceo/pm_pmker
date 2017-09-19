/**
 * Created by leven on 17/2/23.
 */
'use strict';
const moment = require('moment');
module.exports = function () {
    const exports = {};

    const now = new Date();
    const start = (now.getSeconds() + 3) % 60;
    // console.log("start"+start)
    // cron: `${start}/1 * * * * *`,
    exports.schedule = {
        cron: '*/2 * * * * *',
        type: 'worker',
        disable: false,

    };

    exports.task = function*(ctx) {

        yield ctx.service.task.process();

        //处理红包入库
        yield ctx.service.money.task_redpack_process();
    };
    return exports;
};
