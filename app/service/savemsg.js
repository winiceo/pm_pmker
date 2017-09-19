'use strict';
const _ = require('lodash');
const Parse = require('../lib/parse');
const moment = require('moment');
module.exports = app => {
    /**
     * MessageService Api Service
     */
    class MessageService extends app.Service {
        constructor(ctx) {
            super(ctx);


        }

        //支付订单，绑定消息，发送大屏
        * saveMessage(options) {


            const Bpwall = Parse.Object.extend('bpwall');
            const bpwall = new Bpwall();
            bpwall.id = options.bpwall_id;
            bpwall.relation('message').add(options.message);

            yield options.message.fetch()
            return yield bpwall.save().then(function (bpwall) {

                if (options.message.get('type') != 'text') {
                    app.redis.rpush(`message:bp:${options.bpwall_id}`, options.message.id);
                }
                return bpwall;
            });

        }



        // 处理消息
        * message(options) {
             const {ctx, service} = this;
            const message = {

                content: '',
                ds_gif: '',
                type: 'text',
                isshow: '1',
                is_play: '0',
                is_delete: 0,
                redpackid: null,
                createtime: moment().unix(),
                extend_params: null,
            };

            // console.log("=====")
            // app.logger.info('message:save:%s', JSON.stringify(options));
            //console.info((options));

            message.bp_pic_effect = options.body.bp_pic_effect || 'close';
            message.uid = options.userInfo.objectId;
            // message.openid = options.userInfo.openid;
            message.avatar = options.userInfo.headimgurl;
            message.nickname = options.userInfo.nickname;
            message.content = options.body.content || '';
            message.type = options.type;
            message.image = options.image;

            options.message = message;

            switch (options.type) {
                case 'text':
                    // Object.assign(message,this.text(message))
                    break;
                case 'el':
                    Object.assign(options, yield this.el(options));
                    break;
                case 'rp':
                    Object.assign(options, yield this.rp(options));

                    break;
                case 'ds':
                    Object.assign(options, yield this.ds(options));

                    break;
                case 'bp':

                    Object.assign(options, this.bp(options));

                    break;
                default:
                    break;


            }

            const Message = Parse.Object.extend('message');
            const msg = new Message();
            //图片鉴黄
            if (options.message.image) {
                options.message.porn = yield service.ossgreen.checkImage(options.message.image)
            }


            // app.logger.error(options.message)

            return msg.save(options.message);

        }

        // 打赏
        * ds(options) {
            const {ctx, service} = this;

            const extend_params = {};

            const guest = yield service.bpwall.getGuestById(options.bpwall_id, options.body.guest_id);
            const present = yield service.bpwall.getPresentById(options.bpwall_id, options.body.item_id);

            options.message.content = options.userInfo.nickname + '打赏给' + guest.name;

            extend_params.guest_pic = guest.pic;
            extend_params.guest_name = guest.name;


            options.message.image = present.pic;
            options.message.ds_gif = present.df;
            options.message.type = 'ds';
            options.message.bp_time = parseInt(present.bp_time);
            options.message.fee = parseInt(present.price * 100);
            extend_params.item_name = present.name;
            extend_params.says = options.body.says;
            options.message.extend_params = extend_params;
            return options;

        }

        /**
         * 霸屏
         * @param options
         * @returns {*}
         */

        bp(options) {

            // let a={upload:2017.jpg
            // content:kkkkkk
            // imgSrc:http://leven-dev.oss-cn-shanghai.aliyuncs.com//bpmsg/HaDnYC8yuA/1487665921355.jpg
            // bp_index:3
            // type:bp
            // nickname:
            //     admin_bp:on
            // bp_pic_effect:on}

            // move
            // upload:bras.webm
            // content:请大家看小电影5345345435
            // imgSrc:http://leven-dev.oss-cn-shanghai.aliyuncs.com//bpmsg/HaDnYC8yuA/1487666186243.webm
            //     bp_index:0
            // type:video
            // nickname:
            //     admin_bp:on


            const extend_params = {};
            const type = options.body.type;
            if (options.body.imgSrc) {
                options.message.image = options.body.imgSrc;

            }
            if (options.body.bp_index) {
                const bp = options.bpwall.bp_item;
                console.log('bp');

                console.log(bp);

                options.message.bp_time = parseInt(bp[options.body.bp_index].time);
                options.message.fee = parseInt(bp[options.body.bp_index].fee * 100);
            }

            if (type == 'video') {

                options.message.image = 'http://leven-dev.oss-cn-shanghai.aliyuncs.com/static/wall/video.png';
                extend_params.video = options.body.imgSrc;
                extend_params.mime_type = 'video/mp4';
            }
            options.message.extend_params = extend_params;
            return options;
        }

        * el(options) {

            // item_id:vlpS0YTrrK
            // theme_id:LCegBSoH5c
            // uid:61jCYSoOtl
            // love_letter:漫天花雨,只为浪漫我和你
            // image:http://leven-dev.oss-cn-shanghai.aliyuncs.com/static/express_love/images/image_default.png
            //     admin_el:true
            // token:bT03


            const {ctx, service} = this;

            const extend_params = {};

            const love = yield service.bpwall.getLoveById(options.bpwall_id, options.body.theme_id);
            const love_item = yield service.bpwall.getLoveItemById(options.bpwall_id, options.body.item_id);
            const love_user = yield service.user.info(options.body.uid);
            options.love_user = love_user;
            if (love_user) {
                extend_params.lover_name = love_user.nickname;
                extend_params.lover_avatar = love_user.headimgurl;
            } else {
                extend_params.lover_name = '我的爱人';
                extend_params.lover_avatar = app.config.ossURL + '/static/express_love/images/virtual_lover_avatar_x.png';

            }


            extend_params.theme_header = love.header;
            extend_params.theme_src = love.video;
            extend_params.theme_type = 'video';
            extend_params.theme_name = love.name;


            options.message.content = options.body.love_letter || '';

            options.message.bp_time = parseInt(love_item.duration);
            options.message.fee = parseInt(love_item.fee * 100);
            options.message.extend_params = extend_params;
            return options;


        }

        /**
         * 发红包处理
         * @param options
         * @returns {*}
         */
        * rp(options) {

            // num:29
            // money:3
            // content:3
            // desk_name:33
            // payWay:0
            const {ctx, service} = this;
            // console.log(options.body)

            const total = parseFloat(options.body.money);
            const count = parseFloat(options.body.num);
            const pkgs = ctx.helper.generateMoneyPackages(total, count);


            const data = {
                uid: options.userInfo.objectId,
                avatar: options.userInfo.headimgurl,
                nickname: options.userInfo.nickname,
                total: total,
                count: count,
                packages: pkgs,
                status: 'init',
                bpwall_id: options.bpwall_id

            };

            const rp = yield service.redpack.create(data);


            options.message.content = options.body.content || '恭喜发财';
            options.message.desk_name = options.body.desk_name;
            options.message.payWay = parseInt(options.body.payWay);
            options.message.fee = parseInt(options.body.money * 100);

            options.message.redpackid = rp.id;

            return options;
        }


    }

    return MessageService;
};
