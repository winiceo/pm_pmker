'use strict';
const _ = require('lodash');
const Parse = require('../lib/parse');
module.exports = app => {

    class ActivityService extends app.Service {
        constructor(ctx) {
            super(ctx);
            this.config = this.ctx.app.config;
            this.user_id = this.ctx.session.user_id;

        }

        /**
         *获取活动信息
         * @param pageid
         * @returns {*}
         */

        * get(pageid) {
            let page = yield app.redis.hget('activitys', pageid);

            if (!page) {
                app.logger.info('cache:activitys');
                const query = new Parse.Query('activity');
                query.equalTo("objectId", pageid);
                //query.include("award");
                page = yield query.first().then(function (page) {


                    if (page) {
                        return page.toJSON();
                    }
                    return null;

                }, function (err) {
                    app.logger.error(err);
                    return null;
                });

                yield app.redis.hset('activitys', pageid, page);
            }
            page.awardList=yield this.getAward(pageid)
            return page;
        }

        * getAward(id) {


            const Activity = Parse.Object.extend('activity');
            const activity = new Activity();
            activity.id = id;
            const relation = activity.relation('award');
            const query = relation.query();
            query.ascending('index');
            return  yield query.find().then(function (awards) {
                if (awards) {
                    const tmps = [];
                    _.each(awards, function (n) {
                        tmps.push(n.toJSON());
                    });
                    return tmps;
                }
                return null;

            }, function (err) {

                return null;
            });


        }


    }

    return ActivityService;
};
