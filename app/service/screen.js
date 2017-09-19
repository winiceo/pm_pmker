'use strict';
const _ = require('lodash');
const Parse = require('../lib/parse');
module.exports = app => {
    /**
     * screen Api Service
     */
    class ScreenService extends app.Service {
        constructor(ctx) {
            super(ctx);
            this.config = this.ctx.app.config;
            this.user_id = this.ctx.session.user_id;


        }

        /**
         * 获取大屏开关
         * @param bpwall_id
         * @returns {*}
         */
        * getStatus(bpwall_id) {
            const key = `wall:status`;
            return yield app.redis.hget(key,bpwall_id);

        }

        /**
         * 打开大屏
         * @param bpwall_id
         * @returns {number}
         */
        * open(bpwall_id) {
            const key = `wall:status`;
            console.log(key)
            yield app.redis.hset(key, bpwall_id,1);
            return 1;
        }

        /**
         * 关闭大屏
         * @param bpwall_id
         * @returns {number}
         */
        * close(bpwall_id) {
            const key = `wall:status`;
            yield app.redis.hset(key, bpwall_id,0);
            return 1;
        }

    }

    return ScreenService;
};
