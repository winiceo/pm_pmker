'use strict';
const moment = require('moment');

const Parse = require('../../lib/parse');

module.exports = app => {
    class ActivityController extends app.Controller {
        * index() {
            const {ctx, service} = this;
            const activityId = ctx.params.id;

            const Auth = yield ctx.service.common.outh();


            if (Auth.url) {
                return ctx.redirect(Auth.url);
            }
            const userInfo=Auth.userInfo;
            const activity = yield ctx.service.activity.get(activityId);
            activity.myLotteryNum=yield ctx.service.lottery.getNum(activity,userInfo.unionid);

            const config = {
                cdn: '/public/addons/dzp3',
                page: JSON.stringify(activity),
                type: activity.awardList ? activity.awardList.length : 2,
                wxconfig: yield service.wechat.getWechatConfig(`/pm${ctx.request.href}`)

            };

            yield ctx.render('dzp3/index.html', {activity, config});


        }


        * test() {
            const {ctx, service} = this;
            const activityId = ctx.params.id;
            const query = new Parse.Query('activity');

            query.descending('createdAt');
            const activity = yield query.first().then(function(page) {


                if (page) {
                    return page.toJSON();
                }
                return null;

            }, function(err) {
                app.logger.error(err);
                return null;
            });
            activity.awardList = yield service.activity.getAward(activity.objectId);



            //
            // const activity = yield ctx.service.activity.get(activityId);
            // // page.cate='activity'
            // // page.oauth='1'
            // // page.scope='snsapi_base'
            // console.log(JSON.stringify(activity));
            //  console.log(ctx.session)
            //
            //  console.log(ctx.session.user_id)
            //
            // // // 检测是否需要处理微信用户信息
            // //
            // //    ctx.redirect(userInfo)
            // //
            //  const token = app.jwt.sign({ _uid: 3333 }, app.config.jwt.secret);
            // //
            const config = {
                cdn: '/public/addons/dzp3',

                page: JSON.stringify(activity),

            };
            // var tt='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfdWlkIjoiMTIzNDU2IiwiaWF0IjoxNTA1MTgyNzE1fQ.-NJ9JTB_CfsWXus_fPnOsm1frFMEAtr7-6quDps0idI';
            // const {_uid}=app.jwt.verify(tt, app.config.jwt.secret)

            // const { _uid } = app.jwt.verify(tt, app.config.jwt.secret);

            // console.log(_uid);
            yield ctx.render('dzp3/index.html', { activity, config});


        }


    }

    return ActivityController;
};
