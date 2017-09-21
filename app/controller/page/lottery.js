'use strict';
const moment = require('moment');
module.exports = app => {
    // 抽奖
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


            const res = yield ctx.service.lottery.getResult(activityId);


            // res=-1 没中奖 否则为奖品index

            const options = {
                activity: yield ctx.service.activity.get(activityId),
                activityId,
                result: res,
                userInfo: yield service.wechat.currentUser()

            };

            var myLotteryNum=yield app.redis.hincrby('lotterys',`${activityId}:${options.userInfo.unionid}`,-1);

              //console.log(`${activityId}:${options.userInfo.unionid}`)

            let ret = {};
            if (res == -1||myLotteryNum<=0) {
                ret = {
                    code: 0,
                    nickname: options.userInfo.nickname,
                    headimgurl: options.userInfo.headimgurl,
                    time: new Date(),
                    prompt: '',
                    plevel: '',
                    pname: '',
                    num: myLotteryNum,
                    error: 0,
                    rid: 0
                };
            } else {
                // 保存中奖结果
                const result = yield ctx.service.lottery.drawsave(options);

                const stock = yield ctx.service.award.reduceStock(res.objectId);

                ret = {
                    code: result.ObjectId,
                    nickname: options.userInfo.nickname,
                    headimgurl: options.userInfo.headimgurl,
                    time: '2017-09-12 16:10:00',
                    prompt: res.title,
                    plevel: res.grade,
                    pname: res.title,
                    num: myLotteryNum,
                    error: 0,
                    rid: res.index
                };
            }

            ctx.body = ret;

        }

        * getresult() {
            const {ctx, service} = this;
            ctx.body = {result: '59b66a560cf2f5887f677013'};

        }


        * saveinfo() {
            const {ctx, service} = this;
            ctx.body = {result: '59b66a560cf2f5887f677013'};

        }


    }

    return LotteryController;
};
