'use strict';
const Parse = require('../../lib/parse');
const moment = require('moment');
const _ = require('lodash');

const Draw = Parse.Object.extend('drawResult');

//活动管理
//cate 'dzp','zjd'
module.exports = app => {
    class DrawController extends app.Controller {

        * list() {
            const {ctx, service} = this;
            
            const params=ctx.request.query;
            const ret = {
                code:200,
                data:{}
            };
             

            const page = parseInt(params.page) || 1;
            let limit = parseInt(params.limit) || 20;
            const status = parseInt(params.status) ||'';
            const title = (params.title) || '';
            const nickname = (params.nickname) || '';

            if(limit>100){
                limit=100;
            }


            // const account = new Account();
            //
            // account.id = ctx.session.accountId;
            // const relation = account.relation('activity');
            // const userQuery = relation.query();

            const query = new Parse.Query(Draw);

            if (status != "") {
                query.equalTo('status', status);
            }
            console.log(title)
            if (title != "") {
                query.contains('draw.title', title);
            }

            if (nickname != "") {
                query.contains('nickname', nickname);
            }
            query.equalTo('team', ctx.user.team);

            query.limit(limit);
            query.skip(limit * (page-1));
            if(params.sort=="+id"){
                 query.descending('createdAt');// 先进先出，正序排列

             }else{
            query.ascending('createdAt');
             }


            //app.logge.info(limit)
            yield query.count().then(function (count) {
                ret.data.total = count + 1;
                return query.find();

            }).then(function (items) {

                const temp = [];

                _.forEach(items, function (n, i) {
                    const item = n.toJSON();

                    item.createdAt = ctx.helper.dateAt(n.createdAt, 'YYYY/MM/DD');
                    //item.checkTime = ctx.helper.date(n.checkTime, 'YYYY/MM/DD');
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
                code:200,
                data:{}
            };



            console.log(ctx.session.uid)
            const Activity = Parse.Object.extend('activity');
            const activity = new Activity();


            if (body.objectId) {
                activity.id = body.objectId
                yield app.redis.hdel('activitys', activity.id,function(e,b){
                    console.log([e,b])
                });
            }else{

            }

            activity.set('uid',ctx.session.uid );
            activity.set('status',"draft" );
            activity.set(body);

            ret.data=yield activity.save();
            ctx.body=ret;
        }

        * get(){
            const {ctx, service} = this;
            const activityId = ctx.params.id;
            const ret = {
                code:200,
                data: yield service.activity.get(activityId)
            };
            ctx.body=ret;
        }
         //后台核销   
         * check(){
            const {ctx, service} = this;
            const objectId = ctx.params.id;
             const body = ctx.request.body;
            const ret = {
                code:200 
            };


            const query = new Parse.Query('drawResult');
                query.equalTo("objectId", objectId);
                //query.include("award");
                yield query.first().then(function (page) {


                    if (page) {
                        page.set('remark',body.remark)
                        page.set('status',1)
                        page.set('checkTime',moment().format("YYYY-MM-DD:HH:mm"))
                        return page.save();
                    }
                    return null;

                }, function (err) {

                    return null;
                });
            ctx.body=ret;
        }

         //前台核销   
         * checkFront(){
            const {ctx, service} = this;
            const objectId = ctx.params.id;
            const body = ctx.request.body;
            const ret = {
                code:200 
            };
              
            if(!ctx.session.check_unionid){
                ret.code=20001
                ret.message='无权缲作'
                return ctx.body=ret;
            }


            const query = new Parse.Query('drawResult');
                query.equalTo("objectId", objectId);
                query.equalTo("team", ctx.session.check_team);
                //query.include("award");
                yield query.first().then(function (page) {


                    if (page) {
                        page.set('remark',body.remark)
                        page.set('status',1)
                        page.set('checkTime',moment().format("YYYY-MM-DD:HH:mm"))
                        return page.save();
                    }
                    return null;

                }, function (err) {

                    return null;
                });
                if(!query){
                    ret.code=20001
                    ret.message='无权缲作' 
                
                }
            ctx.body=ret;
        }



    }
    return DrawController;
};
