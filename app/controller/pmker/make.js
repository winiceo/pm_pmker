'use strict';
const moment=require("moment")
module.exports = app => {
    class MakeController extends app.Controller {

        constructor(ctx) {
            super(ctx);
            this.app = ctx.app;
           // this.Auth = yield ctx.service.common.outh()


        }
        * home() {
            const {ctx, service} = this;

            //const Auth = yield ctx.service.common.outh()


            // if (Auth.url) {
            //     return ctx.redirect(Auth.url)
            // }
            const userInfo={}
            const config={
                cdn:'/public/addons/pmker',
                user:userInfo,
            }
           // var tt='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfdWlkIjoiMTIzNDU2IiwiaWF0IjoxNTA1MTgyNzE1fQ.-NJ9JTB_CfsWXus_fPnOsm1frFMEAtr7-6quDps0idI';
            //const {_uid}=app.jwt.verify(tt, app.config.jwt.secret)

            //const { _uid } = app.jwt.verify(tt, app.config.jwt.secret);

            //console.log(_uid);
            yield ctx.render('pmker/home.html', {config});


        }

        * mine() {
            const {ctx, service} = this;

            const Auth = yield ctx.service.common.outh()


            // if (Auth.url) {
            //     return ctx.redirect(Auth.url)
            // }
            const config={
                cdn:'/public/addons/pmker',

            }
            // var tt='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfdWlkIjoiMTIzNDU2IiwiaWF0IjoxNTA1MTgyNzE1fQ.-NJ9JTB_CfsWXus_fPnOsm1frFMEAtr7-6quDps0idI';
            //const {_uid}=app.jwt.verify(tt, app.config.jwt.secret)

            //const { _uid } = app.jwt.verify(tt, app.config.jwt.secret);

            //console.log(_uid);
            yield ctx.render('pmker/article/mine.html', { config});


        }

        * hot() {
            const {ctx, service} = this;

            const Auth = yield ctx.service.common.outh()


            // if (Auth.url) {
            //     return ctx.redirect(Auth.url)
            // }
            const config={
                cdn:'/public/addons/pmker',

            }
            // var tt='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfdWlkIjoiMTIzNDU2IiwiaWF0IjoxNTA1MTgyNzE1fQ.-NJ9JTB_CfsWXus_fPnOsm1frFMEAtr7-6quDps0idI';
            //const {_uid}=app.jwt.verify(tt, app.config.jwt.secret)

            //const { _uid } = app.jwt.verify(tt, app.config.jwt.secret);

            //console.log(_uid);
            yield ctx.render('pmker/article/hot.html', { config});


        }




    }
    return MakeController;
};
