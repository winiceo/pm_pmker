'use strict';
const Parse = require('../../lib/parse');
const moment = require('moment');
const _ = require('lodash');


//核销员管理
//cate 'dzp','zjd'
module.exports = app => {
    class CheckController extends app.Controller {

        * list() {
            const {ctx, service} = this;
            const team = ctx.user.team;
            console.log(ctx.session)
            const ret = {
                code: 200,
                data: {},
                options: {team: team}
            };
            const Check = Parse.Object.extend('check');

            const query = new Parse.Query(Check);
            query.equalTo('team', team);
            query.limit(100);
            query.descending('createdAt');// 先进先出，正序排列

            yield query.find().then(function (items) {


                const temp = [];

                _.forEach(items, function (n, i) {
                    const item = n.toJSON();

                    item.createdAt = ctx.helper.dateAt(n.createdAt, 'YYYY/MM/DD');
                    temp.push(item);
                });

                ret.data.items = temp;
            }, function (error) {

            });

            ctx.body = ret;


        }

        * save() {
            const {ctx, service} = this;
            const body = ctx.request.body;
            const ret = {
                code: 200,
                data: {}
            };


            console.log(ctx.session.uid)
            const Activity = Parse.Object.extend('activity');
            const activity = new Activity();


            if (body.objectId) {
                activity.id = body.objectId
                yield app.redis.hdel('activitys', activity.id, function (e, b) {
                    console.log([e, b])
                });
            } else {

            }

            activity.set('uid', ctx.session.uid);
            activity.set('status', "draft");
            activity.set(body);

            ret.data = yield activity.save();
            ctx.body = ret;
        }

        // * get() {
        //     const {ctx, service} = this;
        //     const activityId = ctx.params.id;
        //     const ret = {
        //         code: 200,
        //         data: yield service.activity.get(activityId)
        //     };
        //     ctx.body = ret;
        // }

        * delete() {
            const {ctx, service} = this;
            const checkid = ctx.params.id;
            const ret = {
                code: 200,
                message: '操作成功'
            };
           let query = new Parse.Query("check");
            query.equalTo("objectId", checkid);
            query.equalTo("team", ctx.session.team);
           yield query.first().then(function (item) {
                return item.destroy()

            }, function (err) {

                ret.code = 100002
                ret.message = '没权限操作'
            })

            ctx.body = ret;
        }


    }

    return CheckController;
};
