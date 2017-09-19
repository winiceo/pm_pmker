'use strict';
const _ = require('lodash');
const Parse = require('../lib/parse');
const WechatAPI = require('wechat-api');
const OAuth = require('wechat-oauth');
const Mock = require('mockjs');
const Random = Mock.Random;
module.exports = app => {
    /**
     * 配合测试写的脚本
     */
    class WechatService extends app.Service {
        constructor(ctx) {
            super(ctx);
            this.config = this.ctx.app.config;

        }
        * notify(){


        }

        * getWallId() {
            const query = new Parse.Query('bpwall');
            query.descending('creatAt');
            return yield query.first().then(function (bpwall) {

                return bpwall.id;
            });
        }

        * getSession() {
            const {ctx} = this;
            const query = new Parse.Query('wechat_user');
            query.ascending('creatAt');

            return yield query.first().then(function (user) {
                ctx.session.user_id = user.id;
                console.log(user.toJSON());
                return ctx.session;
            });
        }


        * getRedpack() {
            const {ctx} = this;
            const query = new Parse.Query('RedPackage');
            query.descending('createdAt');

            return yield query.first();
        }

        * getRandSession() {
            const {ctx, service} = this;
            const userQuery = new Parse.Query('wechat_user');

            function shuffle(arra1) {
                let ctr = arra1.length,
                    temp,
                    index;

// While there are elements in the array
                while (ctr > 0) {
// Pick a random index
                    index = Math.floor(Math.random() * ctr);
// Decrease ctr by 1
                    ctr--;
// And swap the last element with it
                    temp = arra1[ctr];
                    arra1[ctr] = arra1[index];
                    arra1[index] = temp;
                }
                return arra1;
            }

            // var myArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
            // console.log(shuffle(myArray));
            const self = this;
            return yield userQuery.find().then(function (users) {
                const a = shuffle(users);
                const user = a.shift();
                return {
                    test: 1,
                    user_id: user.id,
                };

                // self.ctx.session.user_id = user.id
                // self.ctx.session.user_id = user.get("openid")
                //
                // console.log(self.ctx.session)

            });


        }

        /**
         * 获取测试数据
         */
        * getData(type, bpwall_id) {
            const {service} = this;
            const self = this;
            let data = {};
            console.log('leven');
            console.log(type);


            const id = yield app.redis.hincrby('test', 'id', 1);
            console.log(id);
            if (type == 'text') {


                data = Mock.mock({
                    // 属性 id 是一个自增数，起始值为 1，每次增 1
                    content: 'id:' + id, // +Mock.mock('@csentence') + Mock.Random.cname(),
                    // "image": Random.image('200x100', '#894FC4', '#FFF', 'png', Mock.Random.cname()),


                });
            }

            if (type == 'ds') {
                const guest = yield service.bpwall.getGuest(bpwall_id);
                const present = yield service.bpwall.getPresent(bpwall_id);
                data = Mock.mock({
                    // 属性 id 是一个自增数，起始值为 1，每次增 1
                    guest_id: guest[Random.natural(0, guest.length - 1)].objectId,
                    item_id: present[Random.natural(0, present.length - 1)].objectId,
                    says: 'id:' + id + Mock.mock('@csentence'),
                    admin_ds: 1,

                });


                // guest_id:XLmQ3F3ZYz
                // item_id:D6Oqwz8eql
                // says:这个怎么用都可以
                // admin_ds:1


            }

            if (type == 'rp') {

                // num:29
                // money:3
                // content:3
                // desk_name:33
                // payWay:0

                data = Mock.mock({
                    // 属性 id 是一个自增数，起始值为 1，每次增 1
                    num: Random.natural(6, 100),
                    money: Random.natural(100, 1000),
                    content: 'id:' + id + Mock.mock('@csentence'),
                    desk_name: Mock.mock('@csentence'),
                    payWay: '0',

                });


                // guest_id:XLmQ3F3ZYz
                // item_id:D6Oqwz8eql
                // says:这个怎么用都可以
                // admin_ds:1


            }
            if (type == 'bp') {

                // content:请大家看小电影5345345435
                // imgSrc:http://leven-dev.oss-cn-shanghai.aliyuncs.com//bpmsg/HaDnYC8yuA/1487666186243.webm
                //     bp_index:0
                // type:video
                // nickname:
                //     admin_bp:on
                const videos = [
                    'http://leven-dev.oss-cn-shanghai.aliyuncs.com/static/video/dog.webm',
                    'http://leven-dev.oss-cn-shanghai.aliyuncs.com/static/video/car.webm',
                    'http://leven-dev.oss-cn-shanghai.aliyuncs.com/static/video/bras.webm',
                    'http://leven-dev.oss-cn-shanghai.aliyuncs.com/static/video/yh.webm',
                    'http://leven-dev.oss-cn-shanghai.aliyuncs.com/static/video/rose.webm',
                    'http://leven-dev.oss-cn-shanghai.aliyuncs.com/static/video/cucumber.webm',
                    'http://leven-dev.oss-cn-shanghai.aliyuncs.com/static/video/perfume.webm',
                ];

                data = Mock.mock({
                    // 属性 id 是一个自增数，起始值为 1，每次增 1
                    content: 'id:' + id + Mock.mock('@csentence') + Mock.Random.cname(),
                    imgSrc: videos[Random.natural(0, 6)],
                    bp_index: 1,
                    type: 'video',
                    admin_bp: 1,

                });
            }

            if (type == 'el') {

                const loves = yield service.bpwall.getLove(bpwall_id);
                const loveItems = yield service.bpwall.getLoveItem(bpwall_id);
                const user = this.getRandSession();
                data = Mock.mock({
                    // 属性 id 是一个自增数，起始值为 1，每次增 1
                    love_letter: 'id:' + id + Mock.mock('@csentence') + Mock.Random.cname(),
                    item_id: loveItems[Random.natural(0, loveItems.length - 1)].objectId,
                    theme_id: loves[Random.natural(0, loves.length - 1)].objectId,
                    uid: user.user_id,
                    image: Random.image('200x100', '#894FC4', '#FFF', 'png', Mock.Random.cname()),
                    admin_el: 1,

                });


            }

            return data;


        }


    }


    return WechatService;
}
;
