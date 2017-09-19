'use strict';
const _ = require('lodash');
const Parse = require('../lib/parse');
const moment = require('moment');
const RedPackage = Parse.Object.extend('RedPackage');
const UserRed = Parse.Object.extend('UserRed');


module.exports = app => {
    /**

     */
    class RedpackageService extends app.Service {
        constructor(ctx) {
            super(ctx);

        }

        * create(data) {
            return yield new RedPackage().save(data);
        }

        * get(id) {
            return yield app.redis.hget('redPackages', id);
        }

        /**
         * 红包已抢完
         * @param id
         * @returns {*}
         */
        * over(id) {

            const redPackage = new RedPackage();
            redPackage.id = id;
            redPackage.set('status', 'over');
            yield redPackage.save();
            // yield app.redis.del(`redPackages:${id}`)


        }

        /**
         * 将指定红包置于“就绪”状态。
         * 将需要的信息都保存在 Redis 中，保证抢红包期间不会有任何存储服务的操作，
         * 这样可以极大提高应用在高并发时的响应速度。
         */

        * ready(id) {


            const query = new Parse.Query(RedPackage);
            return yield query.get(id).then(function (redPackage) {

                return app.redis.hset('redPackages', id, JSON.stringify({
                    id: redPackage.id,
                    total: redPackage.get('total'),
                    count: redPackage.get('count'),
                    packages: redPackage.get('packages'),
                    nickname: redPackage.get('nickname'),
                    avatar: redPackage.get('avatar'),
                    content: redPackage.get('content'),
                    uid: redPackage.get('uid'),
                    bpwall_id:redPackage.get('bpwall_id')
                }));
            }).then(function () {
                const redPackage = new RedPackage();
                redPackage.id = id;
                redPackage.set('status', 'ready');
                return redPackage.save();
            });


        }


    }

    return RedpackageService;
};
