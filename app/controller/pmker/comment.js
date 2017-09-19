'use strict';
const moment=require("moment")
const Parse = require('../../lib/parse');

module.exports = app => {
    class ArticleController extends app.Controller {


        * save() {
            const {ctx, service} = this;
            const body = ctx.request.body;
            const ret = {
                error:0

            };
            const Article = Parse.Object.extend('comment');
            const article = new Article();

            if (body.objectId) {

            }else{
                article.set(body);
                const artilce=yield article.save();
                ret.url="/pmker/article/view/"+body.oid
                ret.subscribeurl="/pmker/article/view/"+body.oid
            }
            ret.msg='发送成功'

            ctx.body=ret;
        }




    }
    return ArticleController;
};
