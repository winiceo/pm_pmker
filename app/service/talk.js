'use strict';
const _ = require('lodash');
const Parse = require('../lib/parse');
const moment = require('moment');
moment.locale('zh-CN');
module.exports = app => {
    /**
     * MessageService Api Service
     */
    class TalkService extends app.Service {
        constructor(ctx) {
            super(ctx);
            // this.config = this.ctx.app.config.news;
            // this.serverUrl = this.config.serverUrl;
            // this.pageSize = this.config.pageSize;
        }

        /**
         * 获取聊天室名字
         * @param from
         * @param to
         */
        * getRoom(from, to) {
            let room = yield this._getRoom(from, to);
            if (room) {
                return room;
            }
            room = yield this._getRoom(to, from);
            if (room) {
                return room;
            }

            room = yield this.createRoom(from, to);

            console.log('====');
            console.log(room);
            return room;

        }

        * _getRoom(from, to) {
            const query = new Parse.Query('room');

            query.equalTo('from_to', `${from}||${to}`);

            return yield query.first();

        }

        * createRoom(from, to) {
            const Room = Parse.Object.extend('room');
            const room = new Room();
            room.set('from_to', `${from}||${to}`);
            return yield room.save();
        }

        // 获取客户端消息
        * message(options) {
            const {ctx, service} = this;
            const query = new Parse.Query('talk');
            const room = yield this.getRoom(options.from, options.to);
            query.equalTo('room', room.id);
            query.equalTo('is_delete', 0);


            if (options.maxid) {

                query.greaterThan('createtime', options.maxid);

            }
            if (options.minid) {
                query.lessThan('createtime', options.minid);

            }

            query.limit(options.pagesize);

            query.descending('createtime');// 先进先出，正序排列


            const bpmsg = [];

            yield query.find().then(function (messages) {


                _.forEach(messages, function (msg, i) {


                    msg.set('mine', options.to == msg.get('to'));

                    bpmsg.push(msg);
                });

            });
            return bpmsg.reverse();


        }

        /**
         * 保存talk
         * @param options
         */
        * savemsg(options) {
            const Talk = Parse.Object.extend('talk');
            const talk = new Talk();
            const data = {
                from: options.from,
                to: options.to,
                content: options.content,
                image: options.image,
                createtime: moment().unix(),
                nickname: options.userInfo.nickname,
                headimgurl: options.userInfo.headimgurl,
                is_delete: 0,

            };
            const room = yield this.getRoom(options.from, options.to);
            if (room) {
                data.room = room.id;
            }

            talk.set(data);
            yield talk.save();
        }


        * clear(from, to) {
            const {ctx, service} = this;
            const room = yield this.getRoom(from, to);

            const query = new Parse.Query('talk');
            query.equalTo('room', room.id);

            yield query.find().then(function (messages) {
                // Collect one promise for each delete into an array.
                const promises = [];

                _.each(messages, function (msg) {
                    msg.set('is_delete', 1);

                    promises.push(msg.save());
                });

                // Return a new promise that is resolved when all of the deletes are finished.
                return Parse.Promise.when(promises);


            });


        }
    }

    return TalkService;
}
;
