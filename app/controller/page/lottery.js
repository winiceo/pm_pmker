'use strict';
const moment = require("moment")
module.exports = app => {
    //抽奖
    class LotteryController extends app.Controller {
        * awardresult() {
            const {ctx, service} = this;
            const pageid = ctx.params.id;

            const page = yield ctx.service.page.get(pageid);
            ctx.body = [];
        }

        * draw() {
            const {ctx, service} = this;
            const activityId = ctx.params.id;


            const res=yield ctx.service.lottery.getResult(activityId);


            //res=-1 没中奖 否则为奖品index

            const options={
                activity:yield ctx.service.activity.get(activityId),
                activityId:activityId,
                result:res,
                userInfo:yield  service.wechat.currentUser()

            }
            //console.log(options)

            let ret={}
            if(res==-1){
                 ret = {
                    "code": 0,
                    "nickname": options.userInfo.nickname,
                    "headimgurl": options.userInfo.headimgurl,
                    "time": new Date(),
                    "prompt": "",
                    "plevel": '',
                    "pname": '',
                    "num": 3,
                    "error": 0,
                    "rid": 0
                }
            }else{
                //保存中奖结果
                const result=yield ctx.service.lottery.drawsave(options)

                const stock=yield ctx.service.award.reduceStock(res.objectId)

                ret = {
                    "code": result.ObjectId,
                    "nickname": options.userInfo.nickname,
                    "headimgurl": options.userInfo.headimgurl,
                    "time": "2017-09-12 16:10:00",
                    "prompt": "\u6ee1100\u5143\u53ef\u7528",
                    "plevel": res.grade,
                    "pname": res.name,
                    "num": 24,
                    "error": 0,
                    "rid": res.index
                }
            }

            ctx.body = ret

        }

        * getresult() {
            const {ctx, service} = this;
            ctx.body = {result: "59b66a560cf2f5887f677013"};

        }



        * saveinfo() {
            const {ctx, service} = this;
            ctx.body = {result: "59b66a560cf2f5887f677013"};

        }


    }

    return LotteryController;
};
