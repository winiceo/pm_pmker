'use strict';

const WXBizMsgCrypt = require('wechat-crypto');
const wechat = require('co-wechat');
const Config = require('../../../config/app.config')

module.exports = app => {
    class HomeController extends app.Controller {
        async prehandle(ctx, next) {
            const appid = Config.wechat.appid;
            const token = Config.wechat.token;

            ctx.wx_token = token
            // 或者
            const encodingAESKey = Config.wechat.encodingAESKey;
            console.log(Config.wechat)
            ctx.wx_cryptor = new WXBizMsgCrypt(token, encodingAESKey, appid);
            await next();
        }
    }



    return HomeController;
};