'use strict';
const Parse = require('../../lib/parse');
const moment = require('moment');
const _ = require('lodash');
const fs = require('hexo-fs');
const RedPackage = Parse.Object.extend('RedPackage');

const md5=require('md5');
module.exports = app => {
    class UserController extends app.Controller {

        constructor(ctx) {
            super(ctx);
            this.app = ctx.app;
            this.__ = this.ctx.__.bind(this.ctx);
        }

        * login() {
            const {ctx, service} = this;
            const body = ctx.request.body;

            const Account = Parse.Object.extend('account');

            const ret = {
                code: 200,
                message: ''
            };

            // {"username":"15810042722","password":"123456","agreement":"true","bar_name":"asdfasdf","token":"a53bf09a1ea0aafa2b9e78b4a76f0d77","sms_code":"4234"}
            const query = new Parse.Query('account');
            query.equalTo('username', body.username);
            query.equalTo('password', md5(body.password));


            yield query.first().then(function (account) {

                if (account) {

                    ret.message = '登录成功';
                    // account.set('role', ['guest','admin']);


                    ctx.session.accountId = account.id;
                    ctx.session.uid = account.id;
                    ctx.session.team = account.get('team');
                    // ret.data = account;
                    ret.data = {userinfo:  service.account.format(account)};


                } else {
                    ret.code = 10010;
                    ret.message = '登录失败，请检查手机号或者密码是否正确';

                }

            }, function (e) {
                ret.code = 10002;
                ret.message = e;

            });
            ctx.body = ret;

        }


        * logout() {
            const {ctx, service} = this;
            ctx.cookies.set('token', null);
            ctx.cookies.set('roles', null);
            ctx.cookies.set('team', null);
            ctx.body = {code: 200, data: {}};
        }

        * userinfo() {
            const {ctx, service} = this;
            const ret = {
                code: 200,
                message: '',
                data: {}
            };
            const user = ctx.user;
            const query = new Parse.Query('account');

            yield query.get(user.accountId).then(function (account) {

                if (account) {
                    //var info=service.account.format(account.toJSON());

                    ret.data = {userinfo: service.account.format(account)};

                } else {
                    ret.code = 10001;
                    ret.message = '用户不存在';

                }

            }, function (e) {
                ret.code = 10002;
                ret.message = e;

            });


            ctx.body = ret;
        }


        * register() {

            const {ctx, service} = this;
            const body = ctx.request.body;

            const ret = {
                code: 200
            };
            // if (body.captcha !== ctx.session.captcha) {
            //     ret.code = 50002;
            //     ret.message = `${body.captcha}验证码不正确${ctx.session.captcha}`
            //     return ctx.body = ret;
            // }

            const query = new Parse.Query('account');
            const options = {};
            query.equalTo('username', body.username);
            console.log(body.username)
            yield query.first().then(function (account) {

                if (!account) {
                    const Account = Parse.Object.extend('account');

                    account = new Account();
                    account.set('username',body.username);
                    account.set('password',md5(body.password));
                    account.set('roles', ['guest', 'store']);
                    return account.save();
                } else {
                    return Parse.Promise.error('此用户已存在');

                }
            }).then(function (account) {
                options.account = account;
                ctx.session.uid = account.id;
                ret.message = '注册成功';

                const Team = Parse.Object.extend('team');
                const team = new Team();
                team.set('account', account.id);
                return team.save();

            }).then(function (team) {
                options.account.set('team', team.id);
                return options.account.save();
            }, function (error) {

                ret.code = 10002;
                ret.message = error;

            }).then(function (e) {
                console.log(e)
                'use strict';
            });
            console.log(ret)
            ctx.body = ret;

        }

        * resetpwd() {
            const {ctx, service} = this;
            const body = ctx.request.body;
            const ret = {
                code: 200,
                message: '',
                data: {}
            };
            const user = ctx.user;
            const query = new Parse.Query('account');

            yield query.get(user.accountId).then(function (account) {

                if (account) {

                    account.set('password', body.password);
                    return account.save();


                } else {
                    ret.code = 10001;
                    ret.message = '用户不存在';

                }

            }, function (e) {
                ret.code = 10002;
                ret.message = e;

            });


            ctx.body = ret;
        }


    }

    return UserController;
};
