'use strict';
const Parse = require('../../lib/parse');
const moment = require('moment');
const _ = require('lodash');
const Activity = Parse.Object.extend('activity');

// php 调用此接口
// cate 'dzp','zjd'
module.exports = app => {
    class ActivityController extends app.Controller {

        * list() {
            const {ctx, service} = this;

            const params = ctx.request.body;
            const ret = {
                code: 200,
                data: {}
            };
            const accountId =  params.accountId||"" ;
            const status =  params.status||"published" ;
            let limit = parseInt(params.limit) || 20;

            const query = new Parse.Query(Activity);

            if (accountId != '') {
                query.equalTo('accountId', accountId);
            }
            if (status != '') {
                query.equalTo('status', status);
            }
            query.limit(limit);
            query.descending('createdAt');// 先进先出，正序排列
            //console.log(params)
            yield query.find().then(function (items) {

                const temp = [];

                _.forEach(items, function (n, i) {
                    const item = n.toJSON();

                    item.createdAt = ctx.helper.dateAt(n.createdAt);
                    // item.startTimeData = ctx.helper.date(n.startTimeData);
                    // item.endTimeData = ctx.helper.date(n.endTimeData);
                    temp.push(item);
                });

                ret.data.items = temp;
            }, function (error) {

            });

            ctx.body = ret;


        }



    }

    return ActivityController;
};
