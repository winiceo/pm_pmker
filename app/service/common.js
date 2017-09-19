'use strict';
const _ = require('lodash');
const Parse = require('../lib/parse');
module.exports = app => {

    class CommonService extends app.Service {
        constructor(ctx) {
            super(ctx);
            this.config = this.ctx.app.config;
            this.user_id = this.ctx.session.user_id;
        }
        /**
         * 检测此页面是否需要处理微信登录,获取用户信息
         * @param page
         */
        * checkUserInfo(page){
            const {ctx, service} = this;


            const callbackUrl = app.config.appURL + `/${page.cate}/${page.objectId}`;
            const isLogin = yield service.wechat.checkAuth({url: callbackUrl, scop: 'snsapi_base'})

            if (isLogin !== true) {
                return;
            }
            const userInfo = yield service.wechat.info(ctx.session.user_id);
            return userInfo;

        }

        * outh(callback,scope){
            const {ctx, service} = this;
            let userInfo = null;
            if (ctx.session.user_id) {
                userInfo = yield service.wechat.info(ctx.session.user_id);

            }
            console.log('session %s',ctx.session.user_id)
            const ret={

            }
            if (userInfo == null || ctx.session.user_id == null) {
                ctx.session.user_id = null;
                const url = yield service.wechat.checkAuth({url:callback||ctx.request.href, scope: scope||'snsapi_userinfo'})

                ret.url=url;


            }else{
                console.log('这回可以了吗')
                ret.userInfo=userInfo
            }
            console.log('这回可以了吗222')

            console.log(ret)
            return ret;
        }


    }

    return CommonService;
};
