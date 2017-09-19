'use strict';
const _ = require('lodash');
const Parse = require('../lib/parse');
const moment =require("moment")
const types = [];
types[1] = {
    name: '红包付款',
    type: 1,
    to: '平台余额',
    act: 1,
};
types[2] = {
    name: '领取红包',
    type: 2,
    to: '用户钱宝-平台',
    act: 0,
};
types[3] = {
    name: '提现',
    type: 3,
    to: '用户微信红包',
    act: 1,
};
const WechatUser = Parse.Object.extend('wechat_user');
const UserBill = Parse.Object.extend('UserBill');

module.exports = app => {
    /**
     *  用户钱宝相关,账单拆分
     */
    class MoneyService extends app.Service {
        constructor(ctx) {
            super(ctx);
            this.config = this.ctx.app.config;

        }

        /**
         * 转换成分
         * 检测可用余额，处理用户发红包相关
         */
        * checkUserAmount(options) {
            const {ctx, service} = this;
            const userMoney = yield this.getCount(ctx.session.user_id);
            const payMoney = parseInt(options.body.money * 100);

            app.logger.info(`user当前余额${userMoney},需要支付的${payMoney}`);
            if (userMoney > payMoney) {

                return true;

            }
            return false;


        }


        /**
         * 获取当前用户钱宝额度
         */
        * getCount(user_id) {

            const {ctx, service} = this;
            const query = new Parse.Query('wechat_user');
            const result = yield query.select('money').get(user_id);
            return parseInt(result.get('money'));


            // const money = yield app.redis.hget('money', ctx.session.user_id)

            // return money;
        }

        /**
         * 账单列表
         * @param user_id
         * @returns {Array}
         */
        * getList(user_id,page) {
            const {ctx, service} = this;

            let ret = [];
            const options = {
                pagesize: 5,
                page: page||0,
            };
            const wechatUser = new WechatUser();
            wechatUser.id = this.ctx.session.user_id;


            const relation = wechatUser.relation('UserBill');
            const query = relation.query();

            query.limit(options.pagesize);
            query.skip(options.pagesize * options.page);

            query.descending('createdAt');


            return yield query.find()
        }

        /**
         * 生成账单
         *
         * @param options,
         * @param type 1,减，0加
         * @param money
         * @returns {Parse.Promise|*}
         */
        * createBill(data) {
            const userbill = new UserBill();
            const wechatUser = new WechatUser();
            wechatUser.id = data.user_id || this.ctx.session.user_id;
            const type = types[data.type]
            const bill = {
                bpwall_id: '',
                type: type.type,
                title: type.name,
                act: parseInt(type.act),
                moneyTo: type.to,
                money: 0,
                user_id: ''
            }
            let billData = Object.assign(bill, data)

            billData.bar_name = yield this.service.bpwall.getItem(billData.bpwall_id, 'wall_title')

            //所有钱相关的存数据库前均为元，均需转化成分；
            if (type.act == 1) {
                billData.money = -parseInt(billData.money * 100)
            } else if (type.act == 0) {
                billData.money = parseInt(billData.money * 100);

            }
            //加入榜单
            if(type.type==1){
                yield app.redis.zincrby(`wb:${billData.bpwall_id}:${moment().format('YYYYMMDD')}`, billData.money,billData.user_id)
                yield app.redis.zincrby(`wb:${billData.bpwall_id}`, billData.money,billData.user_id)

            }

            //获取上次结余；
            yield wechatUser.fetch()
            billData.balance = wechatUser.get('money')
            userbill.set(billData);

            return yield userbill.save().then(function (userbill) {
                wechatUser.relation('UserBill').add(userbill)

                wechatUser.increment('money', userbill.get('money'));

                return wechatUser.save()

            });


        }

        // 处理红包数据入库,更新用户的钱宝
        * task_redpack_process() {

            let rpData = yield app.redis.lpop('redPackages:result');
            // let rpData1 = yield app.redis.lrange('redPackages:result', 0, -1)
            // let rpData = rpData1.pop()
            const type = types[2]

            if (rpData) {
                rpData = JSON.parse(rpData);
                const billData = {
                    user_id: rpData.uid,
                    bpwall_id: rpData.bpwall_id,
                    type: type.type,
                    title: type.name,
                    act: parseInt(type.act),
                    moneyTo: type.to,
                    money: rpData.money
                }
                console.log(rpData)
                return yield this.createBill(billData)

            }
            return false;

        }


    }

    return MoneyService;
};
