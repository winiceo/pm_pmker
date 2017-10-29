'use strict';
const _ = require('lodash');
const Parse = require('../lib/parse');
const Luck = require('../lib/luck');
const moment = require('moment');

module.exports = app => {
    /**
     * wall Api Service
     */
    class LotteryService extends app.Service {
        constructor(ctx) {
            super(ctx);
            this.config = this.ctx.app.config;
            this.user_id = this.ctx.session.user_id;
        }

        /**
         * 活动信息json
         * @param activity
         */
        * getNum(activity,unionid){
            //yield app.redis.hincrby(`admin:${bpwall_id}:${uid}`, `admin_${type}_times`, -1);

            const lotteryNum = yield app.redis.hget('lotterys',`${activity.objectId}:${unionid}`);

            console.log(lotteryNum)
            if(_.isEmpty(lotteryNum)){
                yield app.redis.hset(`lotterys`,`${activity.objectId}:${unionid}`,activity.lotteryNum);
                return activity.lotteryNum;
            }
            return lotteryNum;
        }

        /**
         * 清空活动抽奖次数记数
          */
        *restLotteryCount(){
            yield app.redis.del('lotterys');
        }

        /**
         *
         * @param pageid
         * @returns {*}
         */

        * getResult(pageid) {
            const page = yield this.service.activity.get(pageid);

            if (page && page.awardList) {

                const goods = [];
                _.forEach(page.awardList, function (n, key) {
                    n.stock = n.num;
                    goods.push(n);
                });
                const ret = Luck(goods, page.gameRate);

                console.log(ret);
                const index = ret.result;
                console.log(index);
                if (index == -1) {
                    return index;
                } else {
                    const result = page.awardList[index];
                    result.index = index + 1;
                    app.logger.info(result);
                    return result;
                }


            }

            // function getRandomIntInclusive(min, max) {
            //     min = Math.ceil(min);
            //     max = Math.floor(max);
            //     return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
            // }
            // const index=getRandomIntInclusive(0, page.awardList.length - 1)
            // let result = page.awardList[index]
            // result.index=index+1;
            // app.logger.info(result)
            return result;
        }

        * drawsave(options) {

            const Order = Parse.Object.extend('drawResult');
            const order = new Order();

            order.set('userId', options.userInfo.objectId);
            order.set('unionid', options.userInfo.unionid);
            order.set('activityId', options.activityId);
            order.set('nickname', options.userInfo.nickname);
            order.set('draw', options.result);
            order.set('team', options.activity.team);

            order.set('code', yield this.service.code.get());


            order.set('startTime', moment().add(1,'days').format('YYYY-MM-DD'));
            order.set('endTime', moment().add((1+parseInt(options.activity.awardLimitDate)),'days').format('YYYY-MM-DD'));

            order.set('status', 0);
            return yield order.save();

        }

        * mylottery(unionid) {

            const {ctx} = this;
            const query = new Parse.Query('drawResult');
            query.equalTo('unionid', unionid);
            query.descending('createTime');

            // query.include("award");
            const result = yield query.find().then(function (page) {

                if (page) {
                    const goods = [];
                    _.forEach(page, function (n, key) {
                        const m = n.toJSON();
                        m.createtime = ctx.helper.dateAt(m.createdAt, 'YYYY/MM/DD HH:mm');

                        goods.push(m);
                    });
                    return goods;
                }

                return null;

            }, function (err) {
                app.logger.error(err);
                return null;
            });
            console.log(result);
            return result;
        }


    }

    return LotteryService;
};
