'use strict';
const moment=require("moment")
const Parse = require('../../lib/parse');

module.exports = app => {
    class ArticleController extends app.Controller {
        * create() {
            const {ctx, service} = this;
            const activityId = ctx.params.id;

              //const Auth= yield ctx.service.common.outh()
            //
            // console.log(Auth);
            // if(Auth.url){
            //   return   ctx.redirect(Auth.url)
            // }
            // console.log(Auth.userInfo)



            // const activity = yield ctx.service.activity.get(activityId);
            //     // page.cate='activity'
            //     // page.oauth='1'
            //     // page.scope='snsapi_base'
            // console.log(JSON.stringify(activity))
           //  console.log(ctx.session)
           //
           //  console.log(ctx.session.user_id)
           //
           // // // 检测是否需要处理微信用户信息
           // //
           // //    ctx.redirect(userInfo)
           // //
           //  const token = app.jwt.sign({ _uid: 3333 }, app.config.jwt.secret);
           // //
            const config={
                cdn:'/public/addons/pmker',
                wxconfig:yield service.wechat.getWechatConfig(ctx.request.href)

            }

              yield ctx.render('pmker/article/create.html', { config});


        }

        * save() {
            const {ctx, service} = this;
            const body = ctx.request.body;
            const ret = {
                error:0

            };
            const Article = Parse.Object.extend('article');
            const article = new Article();

            if (body.objectId) {

            }else{
                article.set(body);
                const artilce=yield article.save();
                ret.url="/pmker/article/view/"+article.id
            }
            ret.msg='发布成功，快快分享给你的好友吧'

            ctx.body=ret;
        }
        * view(){
            const {ctx, service} = this;
            const articleId = ctx.params.id;
            const Article = Parse.Object.extend('article');
            const article = new Article();
            article.id=articleId;
            yield article.fetch()

            const config={
                cdn:'/public/addons/pmker',
                //wxconfig:yield service.wechat.getWechatConfig(ctx.request.href),
                article:article.toJSON(),
                userid:''

            }
            console.log(config)

            yield ctx.render('pmker/article/view.html', { config});

        }

        * comment(){
            const {ctx, service} = this;
            const articleId = ctx.params.id;
            const Article = Parse.Object.extend('article');
            const article = new Article();
            article.id=articleId;
            yield article.fetch()

            const config={
                cdn:'/public/addons/pmker',
                //wxconfig:yield service.wechat.getWechatConfig(ctx.request.href),
                article:article.toJSON(),
                userid:''

            }
            console.log(config)

            yield ctx.render('pmker/article/comment.html', {config});

        }




    }
    return ArticleController;
};
