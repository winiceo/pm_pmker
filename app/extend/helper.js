'use strict';
const K = require('parse/node');
const OAuth = require('co-wechat-oauth');
const moment = require('moment');
const Payment = require('../lib/payment');
// /const Payment=require('wechat-pay').Payment
const WechatAPI = require('wechat-api');

const fs = require('fs');
moment.locale('zh-cn');
module.exports = {
    format_redis_result(result) {
        if (Array.isArray(result)) {
            var obj = {};
            for (var i = 0; i < result.length; i += 2) {
                obj[result[i]] = result[i + 1];
            }
            return obj;
        }
        return result;
    },
    dateAt(date, format) {
        date = moment(date, moment.ISO_8601)

        format = format || 'YYYY/MM/DD HH:mm';
        return date.format(format);

    },
    date(date, format) {
        date = moment.unix(date);

        if (format == 2) {
            return date.fromNow();
        }
        format = 'YYYY/MM/DD';
        return date.format(format);

    },

    parse() {
        const env = this.ctx.config;
        // console.log(env);
        K.initialize(env.app_id, env.master_key);
        K.serverURL = env.server_url;
        return K;
    },
    wechatApi(){
        const config = this.app.config;
        const Api = new WechatAPI(config.wechat.appid, config.wechat.appsecret);
        Api.setOpts({timeout: 2*5000})
        return Api;

    },
    payment() {

        const env = this.app.config.env;

        const initConfig = {
            partnerKey: env.get('WECHAT_PAY_KEY'),
            appId: env.get('WECHAT_APPID'),
            mchId: env.get('WECHAT_PAY_MID') + '',
            notifyUrl: `${this.app.config.baseUrl}/api/pay/notify`,
            pfx: fs.readFileSync(this.app.config.certpfx),
        };
        console.log(initConfig);
        const payment = new Payment(initConfig);
        return payment;
    },
    * oauthClient(callback) {
        const config = this.app.config;
        // console.log(config)
        const key = 'wechat:access_token:';
        const self = this;

        const oauthApi = new OAuth(config.wechat.appid, config.wechat.appsecret, function*(openid) {
            // 传入一个根据openid获取对应的全局token的方法
            const txt = yield self.ctx.app.redis.hget('token', openid);//
            console.log(txt);
            // var txt= fs.readFile(openid +':access_token.txt', 'utf8');
            return txt;
        }, function*(openid, token) {
            // 请将token存储到全局，跨进程、跨机器级别的全局，比如写到数据库、redis等
            // 这样才能在cluster模式及多机情况下使用，以下为写入到文件的示例
            // 持久化时请注意，每个openid都对应一个唯一的token!

            console.log(openid);

            yield self.ctx.app.redis.hset('tokens', openid, token);
            // yield fs.writeFile(openid + ':access_token.txt', JSON.stringify(token));
        });
        return oauthApi;
        // const client =yield new OAuth(config.wechat.appid, config.wechat.appsecret, function(openid, callback) {
        //   const token =yield  self.app.redis.get(key + openid);
        //   callback(null, JSON.parse(token));
        //
        // }, function(openid, token, callback) {
        //    yield this.ctx.app.redis.set(key + openid, JSON.stringify(token));
        //   callback(null, token);
        // });
        //
        // return client;

    },
    // 红包算法
    generateMoneyPackages(total, count) {
        const result = [];
        let leftMoney = total;
        let leftCount = count;
        const min = 0.01;
        while (leftCount > 1) {
            const max = leftMoney / leftCount * 2;
            let current = Math.random() * (max - min) + min;
            current = current.toFixed(2);
            result.push(current);
            leftMoney -= current;
            leftCount--;
        }
        result.push(leftMoney.toFixed(2));
        console.log('generate: total=%d, count=%s, result=%j', total, count, result);
        return result;
    },


    money(val) {
        const lang = this.ctx.get('Accept-Language');
        if (lang.includes('zh-CN')) {
            return `￥ ${val}`;
        }
        return `$ ${val}`;
    },
};
