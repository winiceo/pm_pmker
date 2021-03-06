'use strict';
const moment = require('moment');
const Parse = require('../../lib/parse');
module.exports = app => {
    class QrcodeController extends app.Controller {

        * check() {
            const {ctx, service} = this;
            const code = ctx.params.id;
            const options = {};
            const ret = {
                code: 200
            };
            // /ctx.session.user_id=null
            //  //检测是否需要处理微信用户信息
            const Auth = yield ctx.service.common.outh();


            if (Auth.url) {
                return ctx.redirect(Auth.url);
            }
            options.auth = Auth;

            const Check = Parse.Object.extend('check');
            const queryCheck = new Parse.Query(Check);

            const DrawResult = Parse.Object.extend('drawResult');

            const drawResultQuery = new Parse.Query(DrawResult);
            drawResultQuery.equalTo('code', parseInt(code));
            const drawResult = yield drawResultQuery.first();


            if (drawResult) {
                queryCheck.equalTo('team', drawResult.get('team'));
                queryCheck.equalTo('unionid', Auth.userInfo.unionid);
                const me = yield queryCheck.first();
                if (!me) {
                    ret.message = '没权限操作';
                    return ctx.success({page: ret});
                }
                let now = moment().format('YYYY-MM-DD')
                if (now < drawResult.get('startTime')) {
                    ret.message = '当天不能使用';
                    return ctx.success({page: ret});
                }
                if (now > drawResult.get('endTime')) {
                    ret.message = '已过期，无法使用';
                    return ctx.success({page: ret});
                }


                ctx.session.check_team = drawResult.get('team');
                ctx.session.check_unionid = Auth.userInfo.unionid;

                const config = {
                    cdn: '/public/addons/check',
                    page: (drawResult.toJSON())


                };
                yield ctx.render('check/index.html', {config});
            } else {
                ret.message = '无效二维码';
                return ctx.success({page: ret});
            }


        }


    }

    return QrcodeController;
}
;
