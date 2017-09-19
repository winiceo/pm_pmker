'use strict';
const svgCaptcha =require( 'svg-captcha');

 
module.exports = app => {
    class CommonController extends app.Controller {

        * captcha() {

            const {ctx, service} = this;
            var captcha = svgCaptcha.create({ noise: 3, color: false ,ignoreChars:'2Z0o1i'});
            ctx.session.captcha = captcha.text.toLowerCase();
            ctx.response.ct= 'image/svg+xml';

            ctx.body=captcha.data

        }
 

    }

    return CommonController;
};
