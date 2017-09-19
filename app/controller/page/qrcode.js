'use strict';
const moment = require("moment")
const Parse = require("../../lib/parse")
module.exports = app => {
    class QrcodeController extends app.Controller { 

        * check() {
            const {ctx, service} = this;
            const code = ctx.params.id;
            const options = {
                 
            } 
            const ret={
                code:200
            }
            ///ctx.session.user_id=null
            //  //检测是否需要处理微信用户信息
            const Auth = yield ctx.service.common.outh()


            if (Auth.url) {
                return ctx.redirect(Auth.url)
            }
            options.auth = Auth;

            var Check = Parse.Object.extend("check"); 
            var queryCheck = new Parse.Query(Check);

            var DrawResult = Parse.Object.extend("drawResult");

            var drawResultQuery = new Parse.Query(DrawResult);    
            drawResultQuery.equalTo('code', parseInt(code));
            var drawResult=yield drawResultQuery.first()



            if(drawResult){
               queryCheck.equalTo('team',drawResult.get('team')) 
               queryCheck.equalTo('unionid',Auth.userInfo.unionid)
               var me=yield queryCheck.first();
               if(!me){
                    ret.message='没权限操作'
                    return ctx.success({page:ret})
               } 
               ctx.session.check_team=drawResult.get('team')
               ctx.session.check_unionid=Auth.userInfo.unionid

               const config={
                    cdn:'/public/addons/check',
                    page:(drawResult.toJSON())

                    
               }
               yield ctx.render('check/index.html', { config});
            }else{
                ret.message='无效二维码'
                return ctx.success({page:ret})
            }


 


        }


    }

    return QrcodeController;
}
;
