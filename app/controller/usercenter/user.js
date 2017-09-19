'use strict';
const moment=require("moment")
module.exports = app => {
    class ActivityController extends app.Controller {
        * index() {
            const {ctx, service} = this;
            const activityId = ctx.params.id;

            const Auth= yield ctx.service.common.outh()


            if(Auth.url){
              return   ctx.redirect(Auth.url)
            }
            console.log(Auth.userInfo)



            //const activity = yield ctx.service.activity.get(activityId);

            const config={
                cdn:'/public/addons/usercenter',
                userinfo: Auth.userInfo,
                myLottery:yield service.lottery.mylottery(Auth.userInfo.unionid)


            }

              yield ctx.render('usercenter/home/score.html', {  config});


        }




    }
    return ActivityController;
};
