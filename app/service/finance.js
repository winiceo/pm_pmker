'use strict';
const _ = require('lodash');
const Parse = require('../lib/parse');

const types = [];
types[1] = {
    name: '霸屏收入',
    type: 1,
    to: '平台余额',
    act: 0,
};
types[2] = {
    name: '收入分成',
    type: 2,
    to: '平台',
    act: 1,
};
types[3] = {
    name: '微信分成',
    type: 3,
    to: '腾讯公司',
    act: 1,
};
types[4] = {
    name: '提现',
    type: 4,
    to: '银行转账',
    act: 1,
};

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
         * 生成账单
         * @param data
         */
        create(order, type, money) {
            const Finance = Parse.Object.extend('finance');
            const finance = new Finance();
            const financeData = {
                orderId: order.id,
                type: type.type,
                title: type.name,
                act: parseInt(type.act),

                actor: '',
                nickname: order.get('nickname'),
                uid: order.get('user_id'),
                bpwallId: order.get('bpwall_id'),
                moneyTo: type.to,
            };

            if (type.act == 1) {
                financeData.money = -parseInt(money)
            } else if (type.act == 0) {
                financeData.money = parseInt(money);

            }

            finance.set(financeData);
            return finance;

        }

        /**
         * 异常时清空记录
         */
        * deleteByOrderId() {

        }

        // 后台任务，拆分订单
        * task_create_bill(options) {
            const {ctx, service} = this;
            const order_id = options.order_id;
            const order = yield service.order.get(order_id);
            const setting = yield service.system.getSetting();
            const charge_platform = setting.charge_platform;
            const charge_weixin = setting.charge_weixin;

            try {
                if (!order) {
                    // 订单不存
                    throw new Error(20010);
                }
                if (order.get('is_pay') !== 1) {
                    // 订单未付款
                    throw new Error(20011);
                }
                if (order.get('is_finance') !== 0) {
                    // 已经处理过，不需要处理
                    throw new Error(20012);
                }


                const datas = [
                    this.create(order, types[1], order.get('money')),
                    this.create(order, types[2], order.get('money') * charge_platform),
                    this.create(order, types[3], order.get('money') * charge_weixin),

                ];
                console.log(datas);
                const Bpwall = Parse.Object.extend('bpwall');
                const bpwall = new Bpwall();
                bpwall.id = order.get('bpwall_id');

                const relation = bpwall.relation('finance');
                let financeResult = []

                return yield Parse.Object.saveAll(datas).then(function (result) {
                    // console.log(result);
                    financeResult = result
                    if (result.length == 3) {
                        result.map(r => {

                            relation.add(r);
                        });
                        return bpwall.save();
                    }
                    return Parse.Promise.error(20014);
                }).then(function () {
                    order.set('is_finance', 1);
                    return order.save();
                }).then(function () {
                    const accountQuery = new Parse.Query('account');

                    accountQuery.equalTo('bpwall', bpwall);
                    return accountQuery.first()

                }).then(function (account) {


                    console.log("234324")
                    console.log(account)
                    let count = 0;
                    financeResult.forEach((n, i)=> {
                        count += n.get("money")
                    })

                    console.log(count)


                    account.increment('money', count);

                    return account.save()

                }).then(function () {
                    return 20000;
                });


            } catch (e) {
                // console.log(e);
                app.logger.error(e);
                return e;
                // /console.log(e)
            }

        }


    }

    return MoneyService;
};
