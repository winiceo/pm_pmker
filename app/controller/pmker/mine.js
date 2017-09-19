'use strict';
const moment=require("moment")
const Parse = require('../../lib/parse');
const Article = Parse.Object.extend('article');
const _ = require('lodash');

module.exports = app => {
    class ArticleController extends app.Controller {
        * article() {
            const {ctx, service} = this; 
            
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

            const query = new Parse.Query(Article);

            // if (cate != "") {
            //     query.equalTo('cate', cate);
            // }
            // query.equalTo('team',ctx.user.team );
            // query.notEqualTo('status','deleted' );


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

            const config={
                cdn:'/public/addons/pmker',
                list:ret.data.items 

            }
            console.log(config)

              yield ctx.render('pmker/article/mine_article.html', { config});

             
        }

         




    }
    return ArticleController;
};
