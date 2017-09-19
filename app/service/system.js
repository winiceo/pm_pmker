/**
 * Created by leven on 17/2/24.
 */
'use strict';
const _ = require('lodash');
const assert = require('assert');
const Parse = require('../lib/parse');


module.exports = app => {
    /**
     * wall Api Service
     */

    class SystemService extends app.Service {
        constructor(ctx) {
            super(ctx);
            this.config = this.ctx.app.config;
            this.user_id = this.ctx.session.user_id;


        }

        /**
         *
         * @returns {Parse.Promise}
         */
        * shortUrl(id) {
            const config = app.config;
            const api = this.ctx.helper.wechatApi()
            const promise = new Parse.Promise();
            api.createLimitQRCode(id, function (err, result) {
                app.logger.info(result)
                'use strict';
                if (err) {
                    promise.reject(err);
                }
                promise.resolve(result.url);
            });
            return promise;
        }

        * getSetting() {
            let setting = yield app.redis.hgetall('setting');
            if (_.isEmpty(setting)) {
                app.logger.info('cache:setting');
                console.info('cache:setting');
                const settingQuery = new Parse.Query('setting');
                setting = yield settingQuery.first().then(function (setting) {


                    return setting.toJSON();

                }, function (err) {
                    return err;
                });
                // console.log(setting);
                yield app.redis.hmset('setting', setting);
            }
            return setting;

        }


        * creatBpwall(data) {
            const Bpwall = Parse.Object.extend('bpwall');
            const bpwall = new Bpwall();
            return yield bpwall.save(data);
        }


        /**
         * 添加管理员
         * @param bpwall_id
         * @param user_id
         */
        * addAdmin(bpwall_id, uid) {

            const Bpwall = Parse.Object.extend({className: 'bpwall'});

            const bpwall = new Bpwall();
            bpwall.id = bpwall_id;

            const Admin = Parse.Object.extend('admin');
            const admin = new Admin();


            // let WechatUser = Parse.Object.extend("wechat_user");

            // let wuser = new WechatUser();

            const query = new Parse.Query('wechat_user');

            query.equalTo('objectId', uid);


            yield query.first().then(function (wuser) {

                admin.set('wechatuser', wuser);

                admin.set('openid', wuser.get('openid'));
                admin.set('name', wuser.get('nickname'));
                admin.set('status', 'true');
                admin.set('bpwall',bpwall)

                return admin.save();
            }).then(function () {




                // /  bpwall.fetch().then(function (wall) {

                const relation = bpwall.relation('admin');
                relation.add(admin);
                return bpwall.save();
                // })


            });


        }

        * createAccount(data) {
            const account = new Parse.Object('account');
            account.set(data);
            return yield account.save();
        }

        * getAccount(id) {
            const query = new Parse.Query('account');

            return yield query.get(id);
        }

        /**
         * 相关插件数据绑定
         * @param id
         */
        * _creatBpwallRelation(bpwall) {
            const promises = [];
            const fileds = ['love', 'love_item', 'guest', 'present'];
            const setting = yield this.service.data.setting();
            const relation = {};
            const objects = [];
            _.each(fileds, function (n) {
                relation[n] = bpwall.relation(n);
                const parseObject = Parse.Object.extend(n);
                _.each(setting[n], function (item) {
                    const object = new parseObject(item);

                    // object.set("bpwall", bpwall)
                    objects.push(object);
                });
            });
            return yield Parse.Object.saveAll(objects)
                .then(function (result) {
                    result.map(r => {

                        relation[r.className].add(r);

                    });
                    console.log(result.length);
                    return bpwall.save();

                });


        }

        /**
         * 创建账号后，配置墙相关
         * @param options
         */
        * create_bpwall(options) {
            const {ctx, service} = this;
            const bpwall = new Parse.Object('bpwall');

            const data = yield {
                bpwall: service.data.bpwall(),
                setting: service.data.setting(),
                account: this.getAccount(options.account_id),
            };

            bpwall.set('bp_item', data.setting.bp_item);


            const bpwallData = Object.assign(
                data.bpwall, {wall_title: data.account.get('bar_name')},
                _.pick(data.setting, 'redpack_item', 'admin_el_times', 'admin_bp_times',
                    'admin_ds_times', 'screen_light', 'roll_speed', 'show_num')
            );


            bpwall.set(bpwallData);
            yield bpwall.save();
            // console.log(bpwall);

            bpwall.set('wechat_qrcode', yield this.shortUrl(bpwall.id)); // 手机端网址
            bpwall.set('mobile_wall_url', app.config.appURL + '/app/' + bpwall.id); // 手机端网址
            bpwall.set('mobile_face_url', app.config.appURL + '/face/' + bpwall.id); // 手机交友
            bpwall.set('web_wall_url', app.config.appURL + '/screen/' + bpwall.id); // 大屏地址
            yield this._creatBpwallRelation(bpwall);
            data.account.set('bpwall', bpwall);
            yield data.account.save();
            //cache
            yield this.service.bpwall.get(bpwall.id)

            return data;

        }


    }

    return SystemService;
};
