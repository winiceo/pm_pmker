'use strict';
const Parse = require('../../lib/parse');
const OAuth = require('wechat-oauth');
const WXBizMsgCrypt = require('wechat-crypto');
const Wechat = require('co-wechat');

const Config = require('../../../config/app.config')
module.exports = app => {
    class WechatController extends app.Controller {

        //处理不同公众号
        async prehandle(ctx, next) {

            console.log(33333)
            const appid = Config.wechat.appid;
            const token = Config.wechat.token;

            ctx.wx_token = token
            // 或者
            const encodingAESKey = Config.wechat.encodingAESKey;
            console.log(Config.wechat)
            ctx.wx_cryptor = new WXBizMsgCrypt(token, encodingAESKey, appid);
            await next();
        }


        /**
         * 微信客户端首页
         */
        // * index() {
        //
        //     const {ctx, service} = this;
        //     const bpwall_id = ctx.params.id;
        //
        //     const callbackUrl = app.config.appURL + `/app/${bpwall_id}`;
        //     const isLogin = yield service.wechat.checkAuth({url: callbackUrl, scop: 'snsapi_base'})
        //
        //     if (isLogin !== true) {
        //         return;
        //     }
        //     const userInfo = yield service.wechat.info(ctx.session.user_id);
        //
        //
        //     // yield service.user.fansToWall(bpwall_id, userInfo.objectId)
        //     //
        //     // const options = yield service.wechat.index(bpwall_id);
        //
        //
        //     yield ctx.render('test/dzp.html', {userInfo});
        //
        // }


        /**
         * 微信授权成功后回调处理
         */
        * callback() {

            const {ctx, service} = this;
            const redirectUrl = ctx.query.url;

            const client = new OAuth(app.config.wechat.appid, app.config.wechat.appsecret);


            const promise = new Parse.Promise();
            let wechatUser = null;
            client.getAccessToken(ctx.query.code, function (err, result) {
                if (err || !result.data || !result.data.openid) {
                    return promise.reject(err);
                }
                client.getUser(result.data.openid, function (err, wuser) {
                    if (err) {
                        return promise.reject(err);
                    }
                    wuser.access_token = result.data.access_token;
                    wuser.expires_in = result.data.expires_in;
                    wuser.refresh_token = result.data.refresh_token;
                    wuser.scope = result.data.scope;

                    console.log(wuser)

                    wechatUser = wuser;
                    promise.resolve();
                });
            });
            const err = yield promise;
            app.logger.error('login: %s', err);

            if (err) {
                ctx.body = err;
            } else {
                yield service.wechat.processUser(wechatUser);
                ctx.redirect(redirectUrl);
            }


        }

        * message(message) {
            const {ctx, service} = this;

            // const message = app.weixin;
            console.log(message);

            ctx.body = message;


        }
    }
    //这里的配置没啥用
    WechatController.prototype.wechat = Wechat({
        token: Config.wechat.token,
        appid: Config.wechat.appid,
        encodingAESKey: Config.wechat.encodingAESKey
    }).middleware(async (message, ctx) => {


        console.log(message)
        const self = this;
        let ret = {
            content: '人人现场',
            type: 'text',
        };
        return ret;

        //
        // if (message.MsgType == 'event' && (message.Event == 'SCAN' || message.Event == 'subscribe')) {
        //
        //     return [
        //         {
        //             title: '你来我家接我吧',
        //             description: '这是女神与高富帅之间的对话',
        //             picurl: 'http://nodeapi.cloudfoundry.com/qrcode.jpg',
        //             url: 'http://nodeapi.cloudfoundry.com/'
        //         }
        //     ];
        //
        //
        // }

    });
    return WechatController;
};
