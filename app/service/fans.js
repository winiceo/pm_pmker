'use strict';
const _ = require('lodash');
const Parse = require('../lib/parse');

const Fans = Parse.Object.extend('fans');

const querystring = require('querystring');

module.exports = app => {
    /**
     *  粉丝用户相关
     */
    class FansService extends app.Service {
        constructor(ctx) {
            super(ctx);
            this.config = this.ctx.app.config;

        }


    }

    return FansService;
};
