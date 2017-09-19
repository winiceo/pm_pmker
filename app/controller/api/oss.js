'use strict';
const Parse = require('../../lib/parse');
const moment = require('moment');
const _ = require('lodash');
const oss = require('ali-oss');

module.exports = app => {
    class OssController extends app.Controller {

        constructor(ctx) {
            super(ctx);
            this.app = ctx.app;
            this.__ = this.ctx.__.bind(this.ctx);
            this.env = this.app.config.env;
            this.store = oss({
                region: this.env.get('ALI_OSS_REGION'),
                accessKeyId: this.env.get('ALI_OSS_ID'),
                accessKeySecret: this.env.get('ALI_OSS_SECRET'),
                bucket: 'leven-dev',

            });


        }

        * list() {
            const {ctx} = this;

            const path = ctx.request.body.path;
            const page = ctx.request.body.page;


            const result = yield this.store.list({
                prefix: path,

            });
            const ret = {
                title: '文件管理',
                content: '',
            };
            const options = {
                files: result.objects || [],
                path,
            };
            ret.list = result.objects || [];
            ret.body = ctx.request.body;
            ret.content = yield ctx.renderView('oss/list.html', options);
            ctx.body = ret;


        }

        * sign() {
            const {ctx} = this;


            const policyText = {
                // 2020-01-01T12:00:00.000Z
                expiration: moment().add(30, 's').toISOString(), // 设置该Policy的失效时间，超过这个失效时间之后，就没有办法通过这个policy上传文件了
                conditions: [
                    ['content-length-range', 0, 1048576000], // 设置上传文件的大小限制
                ],
            };

            const policyBase64 = new Buffer(JSON.stringify(policyText)).toString('base64');


            const signature = this.store.signature(policyBase64);

            const path = ctx.request.query.path;

            const ret ={
                code:200,
                data:{
                    accessid: this.env.get('ALI_OSS_ID'),
                    host: this.env.get('ALI_OSS_HOST'),
                    policy: policyBase64,
                    signature,
                    expire: moment().add('seconds', 30).unix(),
                    dir: path + '/',
                    filename: Date.now(),

                }
            } ;
            ctx.body = ret;
        }

    }
    return OssController;
};
