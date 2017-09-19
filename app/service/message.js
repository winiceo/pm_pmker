'use strict';
const _ = require('lodash');
const Parse = require('../lib/parse');
const moment = require('moment');
moment.locale('zh-CN');

const is = require('is-type-of');

module.exports = app => {
    /**
     * MessageService Api Service
     */
    class MessageService extends app.Service {
        constructor(ctx) {
            super(ctx);
            // this.config = this.ctx.app.config.news;
            // this.serverUrl = this.config.serverUrl;
            // this.pageSize = this.config.pageSize;
        }

        * getMessageById(id) {
            const query = new Parse.Query('message');
            query.equalTo('objectId', id);
            return query.first(id);
        }

        /**
         * 新版大屏消息
         * @param options
         * @returns {{}}
         */
        * newScreenMessage(options) {
            const {ctx, service} = this;
            const Bpwall = Parse.Object.extend('bpwall');

            // console.log(options)
            const bpwall = new Bpwall();
            bpwall.id = options.bpwall_id;

            const relation = bpwall.relation('message');
            const messageQuery = relation.query();
            messageQuery.equalTo('is_delete', 0);
            messageQuery.greaterThan('createtime', options.last);
            //messageQuery.lessThan('createtime', options.minid);

            messageQuery.limit(options.pagesize);
            messageQuery.descending('createtime');// 先进先出，正序排列

            const ret = {};

            ret.options = options
            ret.del = yield app.redis.lrange(`bpwall:delete:${options.bpwall_id}`, 0, -1);
            const bpmsgids = yield app.redis.lrange(`message:bp:${options.bpwall_id}`, 0, -1);
            const firstBpMsg = bpmsgids.shift();

            const messages = yield messageQuery.find().then(function (messages) {

                // console.log(messages)
                const msgs = [];
                _.forEach(messages, function (n, i) {
                    // console.log(n.toJSON())
                    if (n.id !== firstBpMsg) {
                        const msg = n.toJSON();
                        msg.id = msg.objectId;
                        delete (msg.objectId);
                        msg.oid = msg.createtime;
                        msg.time_str = ctx.helper.date(msg.createtime, 1);
                        //msg.createtime = ctx.helper.date(msg.createtime, 1);
                        msgs.push(msg);
                    }
                });
                // console.log(msgs)
                //return msgs.reverse();
                return msgs;

            });

            if (firstBpMsg) {
                let bpmsg = yield this.getMessageById(firstBpMsg);
                //console.log("gooooo")
                if (bpmsg) {
                    bpmsg = bpmsg.toJSON();
                    bpmsg.id = bpmsg.objectId;
                    bpmsg.oid = bpmsg.createtime;
                    if (bpmsg.type == "bp") {
                        if (bpmsg.extend_params.video) {
                            bpmsg.video = bpmsg.extend_params.video
                        }

                        bpmsg.bp = {
                            time: bpmsg.bp_time,
                            effect: bpmsg.bp_pic_effect == "on" ? "open" : "close"
                        }
                    }
                    if (bpmsg.type == 'el') {

                        bpmsg.el = {
                            time: bpmsg.bp_time,
                            lover_name: bpmsg.extend_params.lover_name,
                            lover_avatar: bpmsg.extend_params.lover_avatar,
                            theme_header: bpmsg.extend_params.theme_header,
                            theme_src: bpmsg.extend_params.theme_src,
                            theme_type: bpmsg.extend_params.theme_type,
                            theme_name: bpmsg.extend_params.theme_name,
                        }
                    }
                    if (bpmsg.type == 'ds') {

                        bpmsg.ds = {
                            guest_name: bpmsg.extend_params.guest_name,
                            guest_avatar: bpmsg.extend_params.guest_pic,
                            time: bpmsg.bp_time,
                            item_name: bpmsg.extend_params.item_name,
                            says: bpmsg.extend_params.says,
                        }
                    }
                    if (bpmsg.type == 'rp') {
                        yield bpwall.fetch()
                        bpmsg.bp_time = bpwall.get('redpack_item').reverse_time
                    }

                    messages.unshift(bpmsg);
                    ret.bp = bpmsg;

                    // 设置当前正在进行的霸屏，
                    //yield app.redis.setex(`play:${options.bpwall_id}`, bpmsg.bp_time, firstBpMsg);

                }


            } else {
                ret.bp = null
            }
            if (messages.length > 0) {
                ret.maxid = messages[0].createtime
            } else {
                ret.maxid = 0
            }
            //ret.options=options
            ret.msg = messages;
            return ret;


        }

        /**
         * 大屏消息
         * @param options
         * @returns {{}}
         */
        * screenMessage(options) {
            const {ctx, service} = this;
            const Bpwall = Parse.Object.extend('bpwall');

            // console.log(options)
            const bpwall = new Bpwall();
            bpwall.id = options.bpwall_id;

            const relation = bpwall.relation('message');
            const messageQuery = relation.query();
            messageQuery.equalTo('is_delete', 0);
            messageQuery.greaterThan('createtime', options.lasttime);
            messageQuery.limit(options.pagesize);
            messageQuery.descending('createtime');// 先进先出，正序排列

            const ret = {};
            ret.delmsg = yield app.redis.lrange(`bpwall:delete:${options.bpwall_id}`, 0, -1);
            const bpmsgids = yield app.redis.lrange(`message:bp:${options.bpwall_id}`, 0, -1);
            const firstBpMsg = bpmsgids.shift();
            const messages = yield messageQuery.find().then(function (messages) {

                // console.log(messages)
                const msgs = [];
                _.forEach(messages, function (n, i) {
                    // console.log(n.toJSON())
                    if (n.id !== firstBpMsg) {
                        const msg = n.toJSON();
                        msg.id = msg.objectId;
                        delete (msg.objectId);
                        msg.oid = msg.createtime;
                        msg.createtime = ctx.helper.date(msg.createtime, 1);
                        msgs.push(msg);
                    }
                });
                // console.log(msgs)
                return msgs.reverse();

            });
            const isPlayinng = yield app.redis.get(`play:${options.bpwall_id}`);
            // app.logger.info([firstBpMsg, isPlayinng]);
            if (firstBpMsg && (firstBpMsg != isPlayinng)) {
                let bpmsg = yield this.getMessageById(firstBpMsg);

                if (bpmsg) {
                    bpmsg = bpmsg.toJSON();
                    bpmsg.id = bpmsg.objectId;
                    bpmsg.createtime = ctx.helper.date(bpmsg.createtime, 1);
                    messages.unshift(bpmsg);

                    ret.isbp = true;
                    if (bpmsg.type == 'el') {
                        ret.is_el = true;
                    } else if (bpmsg.type == 'ds') {
                        ret.isds = true;
                    } else if (bpmsg.type == 'rp') {

                        ret.isrp = true;
                        ret.rpList = {
                            avatar: bpmsg.avatar,
                            nickname: bpmsg.nickname,
                        };
                    }
                    ret.bp_uid = bpmsg.uid;
                    ret.bptime = parseInt(bpmsg.bp_time) || 10;
                    ret.bpEndTime = options.lasttime + ret.bptime;
                    // 设置当前正在进行的霸屏，
                    yield app.redis.setex(`play:${options.bpwall_id}`, ret.bptime, firstBpMsg);

                }


            }
            ret.msg = messages;
            return ret;


        }

        // 获取客户端消息
        * clientMessage(options) {
            const Bpwall = Parse.Object.extend('bpwall');

            const bpwall = new Bpwall();
            bpwall.id = options.bpwall_id;

            const relation = bpwall.relation('message');
            const messageQuery = relation.query();
            messageQuery.equalTo('is_delete', 0);

            if (options.maxid) {
                messageQuery.greaterThan('createtime', options.maxid);

            }
            if (options.minid) {
                messageQuery.lessThan('createtime', options.minid);

            }

            messageQuery.limit(options.pagesize);

            messageQuery.descending('createtime');// 先进先出，正序排列
            let isAdmin = 0;
            if (options.adminInfo) {
                isAdmin = 1;
            }
            const ret = {};
            ret.delmsg = yield app.redis.lrange(`bpwall:delete:${options.bpwall_id}`, 0, -1);
            yield messageQuery.find().then(function (messages) {

                let bpmsg = [];

                _.forEach(messages, function (msg, i) {


                    msg.set('mine', options.userInfo.objectId == msg.get('uid'));
                    msg.set('is_admin', isAdmin);
                    bpmsg.push(msg);
                });

                if (messages.length == 0) {
                    ret.maxid = options.maxid;
                } else {
                    ret.maxid = bpmsg[0].get('createtime');
                }

                // 反转数组
                bpmsg = bpmsg.reverse();

                ret.list = bpmsg;


            });
            return ret;


        }

        * get() {
            let setting = yield app.redis.get('setting');
            if (!setting) {
                app.logger.info('cache:setting');
                const settingQuery = new Parse.Query('setting');
                setting = yield settingQuery.first().then(function (setting) {


                    return JSON.stringify(setting.toJSON());

                }, function (err) {
                    return err;
                });
                // console.log(setting);
                yield app.redis.set('setting', setting);
            }
            return JSON.parse(setting);

        }

        * remove(bpwall_id, tid) {
            const {ctx, service} = this;
            const adminInfo = service.admin.adminInfo(bpwall_id, ctx.session.user_id);
            const key = `bpwall:delete:${bpwall_id}`;
            let ret = 1;
            if (adminInfo) {
                const query = new Parse.Query('message');
                query.containedIn('objectId', tid);

                ret = yield query.find().then(function (messages) {
                    // Collect one promise for each delete into an array.
                    const promises = [];

                    _.each(messages, function (msg) {
                        msg.set('is_delete', 1);
                        app.redis.rpush(key, msg.id);
                        promises.push(msg.save());
                    });

                    // Return a new promise that is resolved when all of the deletes are finished.
                    return Parse.Promise.when(promises);

                });
            }
            return ret;
        }

        /**
         * 清空某人全部消息
         * @param bpwall_id
         * @param uid
         * @returns {number}
         */
        * removeByUid(bpwall_id, uid) {
            const {ctx, service} = this;
            const adminInfo = service.admin.adminInfo(bpwall_id, ctx.session.user_id);
            const key = `bpwall:delete:${bpwall_id}`;
            let ret = 1;
            if (adminInfo) {
                const Bpwall = Parse.Object.extend('bpwall');
                const bpwall = new Bpwall();
                bpwall.id = bpwall_id;
                const relation = bpwall.relation('message');
                const messageQuery = relation.query();
                messageQuery.equalTo('uid', uid);

                ret = yield messageQuery.find().then(function (messages) {
                    // Collect one promise for each delete into an array.
                    const promises = [];

                    _.each(messages, function (msg) {
                        msg.set('is_delete', 1);
                        app.redis.rpush(key, msg.id);
                        promises.push(msg.save());
                    });

                    // Return a new promise that is resolved when all of the deletes are finished.
                    return Parse.Promise.when(promises);

                });
            }
            return ret;
        }

        /**
         * 超管理删除消息
         * @param bpwall_id
         * @param tid,数组，或者 字符串
         * @returns {number}
         */
        * removeByAdmin(bpwall_id, tid) {

            const {ctx, service} = this;
            const key = `bpwall:delete:${bpwall_id}`;
            let ids = [];
            let query;
            // 如果是数组,则直接进队列
            if (is.array(tid)) {
                ids = tid;


                query = new Parse.Query('message');
                query.containedIn('objectId', ids);


            }
            // 如果是all，则清空全部
            if (tid == 'all') {

                const Bpwall = Parse.Object.extend('bpwall');
                const bpwall = new Bpwall();
                bpwall.id = bpwall_id;

                query = bpwall.relation('message').query();


            }
            query.equalTo('is_delete', 0);

            yield query.find().then(function (messages) {
                // console.log(messages.length)
                messages.map(function (message) {
                    message.set('is_delete', 1);
                    ids.push(message.id);
                });
                return Parse.Object.saveAll(messages);
            }).then(function () {
                return app.redis.rpush(key, ids);
            });
            // console.log(ids)
            // yield  app.redis.rpush(key, ids);
            // return 1;
        }


    }

    return MessageService;
};
