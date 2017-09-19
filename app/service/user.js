'use strict';
const _ = require('lodash');
const Parse = require('../lib/parse');

const Account = Parse.Object.extend('account');

const querystring = require('querystring');

module.exports = app => {
    /**
     *  用户相关
     */
    class UserService extends app.Service {
        constructor(ctx) {
            super(ctx);
            this.config = this.ctx.app.config;

        }
        * mobile(id) {
            return 'Helle Man!';
        }


        * register(user) {
            const isExist = yield this.checkUserName(user.userName);
            const ret={
                code:0,
                msg:'',
                data:[],
            }
            if(isExist){
                ret.code=1;
                ret.msg='用户名已存在'
                return ret;
            }

            const account = new Account();
            account.set(user);
            ret.data=account.save();
            return ret;

        }

        * checkUserName(userName) {

            const query = new Parse.Query('account');
            query.equalTo('userName', userName);
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
        }

        //
        // * checkAuth(options) {
        //     const {ctx,service}=this;
        //     const query = querystring.stringify(options)
        //     const redirectUrl = `${app.config.baseUrl}/wechat/callback?${query}`;
        //     const userInfo = yield service.user.info(ctx.session.user_id);
        //     if (!userInfo||!ctx.session.user_id) {
        //         ctx.session.user_id = null;
        //
        //         const wechatClient = yield ctx.helper.oauthClient(function (err, client) {
        //             if (err) {
        //                 app.logger.error(err);
        //             }
        //             app.logger.info(client);
        //         });
        //         const url = wechatClient.getAuthorizeURL(redirectUrl, 'state', 'snsapi_userinfo');
        //
        //         ctx.redirect(url);
        //
        //     } else {
        //         return true;
        //     }
        //
        // }
        //
        // * cache(wuser) {
        //     if (wuser) {
        //         yield app.redis.hset('users', wuser.id, wuser.toJSON());
        //     }
        // }
        //
        // * fansToWall(bpwall_id, user_id) {
        //     const Bpwall = Parse.Object.extend('bpwall');
        //     const bpwall = new Bpwall();
        //     bpwall.id = bpwall_id;
        //     const wechatUser = new WechatUser();
        //     wechatUser.id = user_id;
        //
        //     let isExist = yield app.redis.sadd(`wallfans:${bpwall_id}`, user_id);
        //     console.log(isExist)
        //     if (isExist == 1) {
        //         yield wechatUser.fetch().then(function (wechatUser) {
        //             console.log(wechatUser);
        //             bpwall.relation('wechat_user').add(wechatUser);
        //             return bpwall.save();
        //         });
        //     }
        //
        //
        // }
        //
        // /**
        //  * 登录之后用户相关操作
        //  * @param wuser
        //  */
        // * processUser(wuser) {
        //     // const userId = yield app.redis.hget("openids", wuser.openid);
        //     const {ctx}=this;
        //
        //     let userInfo = yield this.infoByOpenid(wuser.openid);
        //     ///app.logger.debug('user:check:%s:%s', bpwall_id, JSON.stringify(userInfo));
        //
        //     // 如果不存
        //     if (!userInfo) {
        //         wuser.money = 0;
        //         const user = yield this.save(wuser);
        //         if (user) {
        //             userInfo = user.toJSON();
        //         }
        //         yield this.cache(user);
        //     }
        //
        //     app.logger.info(userInfo)
        //     console.log(this.ctx.session)
        //     ctx.session.user_id = userInfo.objectId;
        //
        //     return userInfo;
        // }
        //
        // * save(user) {
        //     const wechatUser = new WechatUser();
        //     wechatUser.set(user);
        //     // 0正常 1拉黑
        //     // wechatUser.set("status",1)
        //     wechatUser.set('disabled_permission', 0);
        //     return wechatUser.save();
        // }
        //
        //
        // /**
        //  * 获取当前用户信息
        //  */
        // * info(user_id) {
        //     let userInfo = yield app.redis.hget('users', user_id);
        //     app.logger.info('info:user: %s:%s', JSON.stringify(userInfo), _.isEmpty(userInfo));
        //
        //     if (_.isEmpty(userInfo)) {
        //         const userQuery = new Parse.Query('wechat_user');
        //         userQuery.equalTo('objectId', user_id);
        //         userInfo = yield userQuery.first().then(function (user) {
        //             if (user) {
        //                 user.set('id', user.id);
        //                 return user.toJSON();
        //             }
        //             return null;
        //
        //         }, function (err) {
        //             app.logger.error(err);
        //             return null;
        //         });
        //
        //         if (userInfo) {
        //             yield app.redis.hset('users', user_id, userInfo);
        //             yield app.redis.hset('openids', userInfo.openid, userInfo.objectId);
        //
        //             return userInfo;
        //         }
        //     }
        //     if(userInfo==null){
        //
        //         this.ctx.session.user_id = null;
        //     }
        //
        //     return userInfo;
        //
        // }
        //
        //
        // /**
        //  * 获取当前用户信息
        //  */
        // * infoByOpenid(openid) {
        //     const userId = yield app.redis.hget('openids', openid);
        //
        //     app.logger.info('check:userid: %s openid:%s', userId, openid);
        //
        //     if (!userId) {
        //         const userQuery = new Parse.Query('wechat_user');
        //         userQuery.equalTo('openid', openid);
        //         const userInfo = yield userQuery.first().then(function (user) {
        //             if (user) {
        //                 user.set('id', user.id);
        //                 return user.toJSON();
        //             }
        //             return null;
        //
        //         }, function (err) {
        //             app.logger.error(err);
        //             return null;
        //         });
        //
        //         if (userInfo) {
        //
        //             yield app.redis.hset('users', userInfo.objectId, userInfo);
        //             yield app.redis.hset('openids', openid, userInfo.objectId);
        //
        //
        //             return userInfo;
        //         }
        //
        //     } else {
        //         return yield this.info(userId);
        //     }
        //
        //     return null;
        //
        // }
        //
        //
        // * getUserList(options) {
        //     const {ctx, service} = this;
        //
        //     const ret = {
        //         list: [],
        //     };
        //
        //     console.log(options);
        //
        //     const Bpwall = Parse.Object.extend('bpwall');
        //     const bpwall = new Bpwall();
        //     bpwall.id = options.bpwall_id;
        //     const relation = bpwall.relation('wechat_user');
        //     const userQuery = relation.query();
        //
        //     if (options.type != 0) {
        //         userQuery.equalTo('sex', options.type);
        //     }
        //
        //
        //     userQuery.limit(options.pagesize);
        //     userQuery.skip(options.pagesize * options.page);
        //
        //
        //     yield userQuery.count().then(function (count) {
        //         ret.count = count + 1;
        //         return userQuery.find();
        //
        //     }).then(function (users) {
        //
        //         const temp = [];
        //
        //
        //         _.forEach(users, function (n, i) {
        //             const user = n.toJSON();
        //             user.uid = user.objectId;
        //             user.m_nickname = user.nickname;
        //             user.m_avatar = user.headimgurl;
        //             user.m_sex = user.sex + '';
        //             user.nickname = user.nickname;
        //             user.avatar = user.headimgurl;
        //             // user.sex = user.sex == 1 ? 'male' : 'female';
        //             user.present = false;
        //             temp.push(user);
        //         });
        //         ret.list = temp;
        //     }, function (error) {
        //
        //     });
        //
        //     return ret;
        // }


    }

    return UserService;
};
