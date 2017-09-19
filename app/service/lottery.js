'use strict';
const _ = require('lodash');
const Parse = require('../lib/parse');
const Luck =require('../lib/luck')
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
         *
         * @param pageid
         * @returns {*}
         */

        * getResult(pageid) {
            let page = yield this.service.activity.get(pageid);

            if(page&&page.awardList){

                let goods=[];
                _.forEach(page.awardList, function (n, key) {
                     n.stock=n.num;
                     goods.push(n)
                });
                var ret=Luck(goods,page.gameRate)

                console.log(ret)
                var index=ret.result;
                console.log(index)
                if(index==-1){
                    return index;
                }else{
                    let result = page.awardList[index]
                    result.index=index+1;
                    app.logger.info(result)
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


            order.set('status', 0);
            return yield order.save();

        }

        * mylottery(unionid){

            const{ctx}=this;
            const query = new Parse.Query('drawResult');
            query.equalTo("unionid", unionid);
            //query.include("award");
            const result = yield query.find().then(function (page) {

                if(page){
                    let goods=[];
                    _.forEach(page, function (n, key) {
                        var m=n.toJSON();
                        m.createtime=ctx.helper.dateAt(m.createdAt, 'YYYY/MM/DD HH:mm');

                        goods.push(m)
                    });
                    return goods
                }

                return null;

            }, function (err) {
                app.logger.error(err);
                return null;
            });
            console.log(result)
            return result
        }


    }

    return LotteryService;
};
