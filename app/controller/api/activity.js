'use strict';
const Parse = require('../../lib/parse');
const moment = require('moment');
const _ = require('lodash');

const Activity = Parse.Object.extend('activity');

//活动管理
//cate 'dzp','zjd'
module.exports = app => {
    class ActivityController extends app.Controller {

        * list() {
            const {ctx, service} = this;
            const bpwall_id = ctx.params.id;
            const params=ctx.request.query;
            const ret = {
                code:200,
                data:{}
            };
            let test={cate:'dzp',
                page: 1,
                limit: 20,
                importance: undefined,
                title: undefined,
                type: undefined,
                sort: '+id'
            }

            const page = parseInt(params.page) || 1;
            let limit = parseInt(params.limit) || 20;
            const cate = parseInt(params.cate) || 'dzp';
            const title = parseInt(params.title) || '';

            if(limit>100){
                limit=100;
            }


            // const account = new Account();
            //
            // account.id = ctx.session.accountId;
            // const relation = account.relation('activity');
            // const userQuery = relation.query();

            const query = new Parse.Query(Activity);

            if (cate != "") {
                query.equalTo('cate', cate);
            }
            query.equalTo('team',ctx.user.team );
            query.notEqualTo('status','deleted' );


            query.limit(limit);
            query.skip(limit * (page-1));
            query.descending('createdAt');// 先进先出，正序排列


            //app.logge.info(limit)
            yield query.count().then(function (count) {
                ret.data.total = count + 1;
                return query.find();

            }).then(function (items) {

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
                code:200,
                data:{}
            };
            const Activity = Parse.Object.extend('activity');
            const Award = Parse.Object.extend('award');
            const activity = new Activity();


            if (body.objectId) {
                activity.id = body.objectId

                yield app.redis.hdel('activitys', activity.id,function(e,b){
                    console.log([e,b])
                });
            }else{
                activity.set('accountId',ctx.user.accountId );
                activity.set('team',ctx.user.team );
                activity.set('status',"draft" );
            }

             // yield activity.save().then(function(activity){
             //     var query = new Parse.Query(Award);
             //     query.equalTo("activity", activity);
             //
             // });
            const relation = activity.relation('award');
            // relation.remove(activity)
            // yield activity.save();

            const awards=[]
            _.each(body.awardList, function (item) {
                item.num=parseInt(item.num)
                item.total=parseInt(item.total)
                const award = new Award(item);
                awards.push(award);
            });
            yield Parse.Object.saveAll(awards).then(function (result) {
                result.map(r => {
                    relation.add(r);
                });
                delete(body.awardList)
                activity.set(body);
                return activity.save();

            }).then(function(activity){
                ret.data=activity
            },function(e){
                ret.code="10001"
                ret.message=e;
            });

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


         

        * destoryActivity(){
            const {ctx, service} = this;
            const pageid = ctx.params.id;
            const query = new Parse.Query('activity');
            query.equalTo("objectId", pageid);
            const ret = {
                code:200,
            };
            yield query.first().then(function (page) {


                if (page) {
                    if(page.get('team')==ctx.user.team){
                        page.set('status','deleted')
                        return page.save();
                    }else{
                        ret.code=10020
                        ret.message='没有权限操作'
                    }
                }
                ret.code=10030
                ret.message='活动不在存'


            }, function (err) {
                ret.code=10040
                ret.message='操作错误'
                app.logger.error(err);
                return null;
            });
            ctx.body=ret;

        }

        * destroyAward(){
            const {ctx, service} = this;
            const awardid = ctx.params.id;
            const ret = {
                code:200,

            };
            const Award = Parse.Object.extend('award');
            const award=new Award();
            award.id=awardid
            yield award.destroy({
                success: function(myObject) {
                    // The object was deleted from the Parse Cloud.
                },
                error: function(myObject, error) {
                   ret.message='奖品错误'
                }
            });



            ctx.body=ret;
        }



    }
    return ActivityController;
};
