'use strict';
const _ = require('lodash');
const Parse = require('../lib/parse');



module.exports = app => {
    /**
     *  管理员相关
     */
    class AdminService extends app.Service {
        constructor(ctx) {
            super(ctx);
            this.config = this.ctx.app.config;
        }

        /**
         * 每天六点重新计数
         */
        * restAdminsCount() {
            let adminQuery = new Parse.Query("admin");

            adminQuery.include(["bpwall"]);
            adminQuery.include(["wechatuser"]);

            adminQuery.equalTo('status', 'true');

            return adminQuery.find().then(function (admins) {

                const pipeline = app.redis.pipeline();

                admins.map(admin=> {

                    if (admin.get("bpwall")) {


                        let bpwallInfo = admin.get("bpwall").toJSON();
                        let data = {};

                        data.admin_bp_times = bpwallInfo.admin_bp_times;
                        data.admin_el_times = bpwallInfo.admin_el_times;
                        data.admin_ds_times = bpwallInfo.admin_ds_times;

                        console.log(data)
                        pipeline.hmset(`admin:${admin.get("bpwall").id}:${admin.get('wechatuser').id}`, data);
                    }
                })
                return pipeline.exec();
            }).then(function (result) {
                console.log(result)
                return result;

            })


        }

        // 重新初始化管理员 添加至redis
        * initAdmins(bpwall_id) {
            const bpwallInfo = yield this.service.bpwall.get(bpwall_id);
            const data = {};
            if (bpwallInfo) {
                data.admin_bp_times = bpwallInfo.admin_bp_times;
                data.admin_el_times = bpwallInfo.admin_el_times;
                data.admin_ds_times = bpwallInfo.admin_ds_times;
            }
            const Bpwall = Parse.Object.extend('bpwall');
            const bpwall = new Bpwall();
            bpwall.id = bpwall_id;
            const relation = bpwall.relation('admin');
            const query = relation.query();
            query.equalTo('status', 'true');


            const admins = yield query.find()

            const pipeline = app.redis.pipeline();
            for (let i = 0; i < admins.length; i++) {
                data.uid = admins[i].get('wechatuser').id;
                let isexists = yield app.redis.hgetall(`admin:${bpwall_id}:${data.uid}`)
                // console.log(isexists)
                if (_.isEmpty(isexists)) {
                    pipeline.hmset(`admin:${bpwall_id}:${data.uid}`, data);
                }
            }

            return pipeline.exec();
        }

        /**
         * 判断是否管理员
         * @param bpwall_id
         * @param openid
         * @param type
         * @returns {boolean}
         */
        * adminInfo(bpwall_id, uid) {
            const isAdmin = yield app.redis.hgetall(`admin:${bpwall_id}:${uid}`);

            return _.isEmpty(isAdmin) ? false : isAdmin;

        }

        /**
         * 更新计数
         * @param bpwall_id
         * @param openid
         * @param type
         * @returns {boolean}
         */
        * updateCount(bpwall_id, uid, type) {
            // 递减
            yield app.redis.hincrby(`admin:${bpwall_id}:${uid}`, `admin_${type}_times`, -1);

        }

    }

    return AdminService;
};
