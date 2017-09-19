'use strict';
const moment = require("moment")
const Parse = require("../../lib/parse")
module.exports = app => {
    class CheckController extends app.Controller {
        * test() {
            const ret = {
                success: true,
                message: 'asdfasdf',
            };
            return this.ctx.success({page: ret})
        }

        * join() {
            const {ctx, service} = this;
            const teamId = ctx.params.id;
            const options = {
                teamId: teamId
            }


            ///ctx.session.user_id=null
            //  //检测是否需要处理微信用户信息
            const Auth = yield ctx.service.common.outh()


            if (Auth.url) {
                return ctx.redirect(Auth.url)
            }
            options.auth = Auth;


            // //检测团队
            var Team = Parse.Object.extend("team");

            var queryTeam = new Parse.Query(Team);
            const myTeam=yield queryTeam.get(teamId).then(function(team){
                return team;
            },function(error){
                return false;
            });
            if(!myTeam){
                return ctx.error({page:{message:'参数错误'}})
            }
            const userInfo = Auth.userInfo

            console.log(userInfo)

            const ret = {
                success: true,
                message: '添加成功',
            };


            const Check = Parse.Object.extend('check');
            const check = new Check();
            const query = new Parse.Query('check');
            query.equalTo('team', teamId);
            query.equalTo('openid', userInfo.openid);
            query.equalTo('unionid', userInfo.unionid);
            yield query.first().then(function (item) {
                if (!item) {
                    check.set('team', teamId)
                    check.set('openid', userInfo.openid)
                    check.set('unionid', userInfo.unionid)
                    check.set('userinfo', userInfo)
                    return check.save()
                } else {

                    return Parse.Promise.error("已经是核销员,不要重复添加");
                }
            }).then(function (check) {


                let relation = myTeam.relation("check_list")
                relation.add(check)
                return myTeam.save()


            }).then(function () {

            }, function (error) {

                ret.success = false;
                ret.message = error
            }).then(function () {
                "use strict";

            })

            return this.ctx.success({page: ret})


        }


    }

    return CheckController;
}
;
