'use strict';
const _ = require('lodash');
const Parse = require('../lib/parse');
const moment = require('moment');
const RedPackage = Parse.Object.extend('RedPackage');
const UserRed = Parse.Object.extend('UserRed');
const is = require('is-type-of');
const assert = require('assert');

module.exports = app => {
    /**

     */
    class TaskService extends app.Service {
        constructor(ctx) {
            super(ctx);

        }

        * cache_admin(options) {
            app.logger.info('管理员成员更新', JSON.stringify(options));

            yield this.service.admin.initAdmins(options.bpwall_id);

        }

        /**
         * 重建bpwall绶存
         * @param options
         */
        * cache_bpwall(options) {

            app.logger.info('管理员修改bpwall配置', JSON.stringify(options));
            yield app.redis.hdel('bpwalls', options.bpwall_id);
            yield this.service.bpwall.get(options.bpwall_id)

        }

        /**
         * 重建bpwall绶存
         * @param options
         */
        * clear_cache(options) {

            app.logger.info(`管理员修改配置`, JSON.stringify(options));
            yield app.redis.hdel(`${options.name}s`, options.bpwall_id);


        }

        // 后台管理员删除贴子
        * admin_delete_message(options) {
            // console.log(options)
            yield this.service.message.removeByAdmin(options.bpwall_id, options.ids);
        }

        /**
         * 后台创建账号
         * @param options account_id
         */
        * create_bpwall(options) {
            assert(options.account_id, '账号id必须存在');
            // assert(options.account_id333,'账号id必须存在')
            yield this.service.system.create_bpwall(options);

        }

        /**
         * 第一次运行，配置setting
         * @param options account_id
         */
        * init_system() {
            app.logger.info('系统初始化');

            const setting = new Parse.Object('setting');
            const data = yield this.service.data.setting();
            return yield setting.save(data);

        }

        //后台任务订单处理
        * task_order_proccess(options) {
            assert(options.order_id, '订单id必须存在');
            // assert(options.account_id333,'账号id必须存在')
            yield this.service.finance.task_create_bill(options);
        }


        // 任务队列
        * process() {

            // app.redis.hgetall("key",function (err,result) {
            //     console.log(result)
            // })
            // app.redis.hget("key",'b',function (err,result) {
            //     console.log(result.ok)
            // })


            // const list = yield app.redis.lrange('task', 0, -1);
            // const task=list.pop()
            //
            // // let rpData = yield app.redis.lpop('task');
            // // if (rpData) {
            // //     rpData = JSON.parse(rpData);
            // //
            // //
            // //
            // // }
            // // _.each(list, function (task) {
            // //
            // // });
            const caches=['guest','love','love_item','present']

            const task = yield app.redis.lpop('task');
            if (task) {
                const taskOne = JSON.parse(task);

                app.logger.info(taskOne)
                if(_.indexOf(caches, taskOne.name)!==-1){
                    yield this.clear_cache(taskOne)
                }else{
                    if(_.isFunction(this[taskOne.name])){
                        yield this[taskOne.name](taskOne);
                    }

                }

            }


        }


    }

    return TaskService;
};
