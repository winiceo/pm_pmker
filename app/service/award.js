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

        * reduceStock(objectId) {

                const query = new Parse.Query('award');
                query.equalTo("objectId", objectId);
                //query.include("award");
                yield query.first().then(function (page) {


                    if (page) {
                        page.increment('num',-1)
                        return page.save();
                    }
                    return null;

                }, function (err) {

                    return null;
                });


        }

        * getAward(id) {


            const Activity = Parse.Object.extend('activity');
            const activity = new Activity();
            activity.id = id;
            const relation = activity.relation('award');
            const query = relation.query();
            query.ascending('sort');
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
