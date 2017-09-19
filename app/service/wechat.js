'use strict';
const _ = require('lodash');
const Parse = require('../lib/parse');
const querystring = require('querystring');


module.exports = app => {
    /**
     * SettingService Api Service
     */
    class WechatService extends app.Service {
        constructor(ctx) {
            super(ctx);
            this.config = this.ctx.app.config;
            this.user_id = this.ctx.session.user_id;
            // this.bpwall_id = this.ctx.session.bpwall_id
            this.ctx.app.logger.info(this.ctx.session);
        }

        /**
         * snsapi_base ,snsapi_userinfo
         */

        * checkAuth(options) {
            const {ctx, service} = this;
            const query = querystring.stringify(options)
            const redirectUrl = `${app.config.baseUrl}/wc/callback?${query}`;

            const wechatClient = yield ctx.helper.oauthClient(function (err, client) {
                if (err) {
                    app.logger.error(err);
                }
                app.logger.info(client);
            });

            const url = wechatClient.getAuthorizeURL(redirectUrl, 'state', options.scope);

            return url;


        }

        * cache(wuser) {
            if (wuser) {
                yield app.redis.hset('users', wuser.id, wuser.toJSON());
            }
        }

        * fansToWall(bpwall_id, user_id) {
            const Bpwall = Parse.Object.extend('bpwall');
            const bpwall = new Bpwall();
            bpwall.id = bpwall_id;
            const wechatUser = new WechatUser();
            wechatUser.id = user_id;

            let isExist = yield app.redis.sadd(`wallfans:${bpwall_id}`, user_id);
            console.log(isExist)
            if (isExist == 1) {
                yield wechatUser.fetch().then(function (wechatUser) {
                    console.log(wechatUser);
                    bpwall.relation('wechat_user').add(wechatUser);
                    return bpwall.save();
                });
            }


        }

        /**
         * 登录之后用户相关操作
         * @param wuser
         */
        * processUser(wuser) {
            // const userId = yield app.redis.hget("openids", wuser.openid);
            const {ctx} = this;

            let userInfo = yield this.infoByOpenid(wuser.openid);
            ///app.logger.debug('user:check:%s:%s', bpwall_id, JSON.stringify(userInfo));

            // 如果不存
            if (!userInfo) {
                wuser.money = 0;
                const user = yield this.save(wuser);
                if (user) {
                    userInfo = user.toJSON();
                }
                yield this.cache(user);
            }

            app.logger.info(userInfo)
            console.log('this.ctx.session')
            ctx.session.user_id = userInfo.objectId;
            console.log(ctx.session)

            return userInfo;
        }

        * save(user) {
            const WechatUser = Parse.Object.extend('wechat_user');
            const wechatUser = new WechatUser();
            wechatUser.set(user);
            // 0正常 1拉黑
            // wechatUser.set("status",1)
            //wechatUser.set('disabled_permission', 0);
            return wechatUser.save();
        }

        * currentUser() {
            const {ctx} = this;

            return yield this.info(ctx.session.user_id)
        }


        /**
         * 获取当前用户信息
         */
        * info(user_id) {


            let userInfo = yield app.redis.hget('users', user_id);


            app.logger.info('info:user: %s:%s', JSON.stringify(userInfo), _.isEmpty(userInfo));

            if (_.isEmpty(userInfo)) {
                const userQuery = new Parse.Query('wechat_user');
                userQuery.equalTo('objectId', user_id);
                userInfo = yield userQuery.first().then(function (user) {
                    if (user) {
                        user.set('id', user.id);
                        return user.toJSON();
                    }
                    return null;

                }, function (err) {
                    app.logger.error(err);
                    return null;
                });

                if (userInfo) {
                    yield app.redis.hset('users', user_id, userInfo);
                    yield app.redis.hset('openids', userInfo.openid, userInfo.objectId);

                    return userInfo;
                }
            }
            if (userInfo == null) {

                this.ctx.session.user_id = null;
            }

            return userInfo;

        }


        /**
         * 获取当前用户信息
         */
        * infoByOpenid(openid) {
            const userId = yield app.redis.hget('openids', openid);

            app.logger.info('check:userid: %s openid:%s', userId, openid);

            if (!userId) {
                const userQuery = new Parse.Query('wechat_user');
                userQuery.equalTo('openid', openid);
                const userInfo = yield userQuery.first().then(function (user) {
                    if (user) {
                        user.set('id', user.id);
                        return user.toJSON();
                    }
                    return null;

                }, function (err) {
                    app.logger.error(err);
                    return null;
                });

                if (userInfo) {

                    yield app.redis.hset('users', userInfo.objectId, userInfo);
                    yield app.redis.hset('openids', openid, userInfo.objectId);


                    return userInfo;
                }

            } else {
                return yield this.info(userId);
            }

            return null;

        }


        /**
         * 获取当前用户信息
         */
        * infoByUnionid(unionid) {
            let userInfo = yield app.redis.hget('unionids', unionid);
            if (_.isEmpty(userInfo)) {
                const userQuery = new Parse.Query('wechat_user');
                userQuery.equalTo('unionid', unionid);
                userInfo = yield userQuery.first().then(function (user) {
                    if (user) {
                        user.set('id', user.id);
                        return user.toJSON();
                    }
                    return null;

                }, function (err) {
                    app.logger.error(err);
                    return null;
                });

                if (userInfo) {
                    yield app.redis.hset('users', userInfo.objectId, userInfo);
                    yield app.redis.hset('unionids', unionid, userInfo.objectId);

                    return userInfo;
                }

            } else {
                return null;
            }
        }
        * getWechatConfig(url) {
            const api = this.ctx.helper.wechatApi();
            const param = {
                debug: false,
                jsApiList: ['checkJsApi',
                    'onMenuShareTimeline',
                    'onMenuShareAppMessage',
                    'onMenuShareQQ',
                    'onMenuShareWeibo',
                    'hideMenuItems',
                    'showMenuItems',
                    'hideAllNonBaseMenuItem',
                    'showAllNonBaseMenuItem',
                    'translateVoice',
                    'startRecord',
                    'stopRecord',
                    'onRecordEnd',
                    'playVoice',
                    'pauseVoice',
                    'stopVoice',
                    'uploadVoice',
                    'downloadVoice',
                    'chooseImage',
                    'previewImage',
                    'uploadImage',
                    'downloadImage',
                    'getNetworkType',
                    'openLocation',
                    'getLocation',
                    'hideOptionMenu',
                    'showOptionMenu',
                    'closeWindow',
                    'scanQRCode',
                    'chooseWXPay',
                    'openProductSpecificView',
                    'addCard',
                    'chooseCard',
                    'openCard',
                    'openAddress'],
                url,
            };
            const promise = new Parse.Promise();

            api.getJsConfig(param, function (err, data) {
                console.log(err)
                 console.log(data)
                if (err) promise.reject(err);
                promise.resolve(data);
            });
            return yield promise;
        }
    }

    return WechatService;
}
;
