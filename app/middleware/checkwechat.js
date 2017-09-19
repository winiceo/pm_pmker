/**
 * Created by leven on 17/2/20.
 */


const xmlParser = require('../lib/xml-parser');
const Config = require('../../config/app.config')
const WXBizMsgCrypt = require('wechat-crypto');

module.exports = (options, app) => {
    return function* checkwechat(next) {

        // 后续中间件执行完成后将响应体转换成 gzip
        // /const {ctx, service} = this;

        // console.log(app==this)
        const aid = this.params.id;

        const appid = Config.wechat.appid;
        const token = Config.wechat.token;

        this.wx_token = token
        // 或者
        const encodingAESKey = Config.wechat.encodingAESKey;
        console.log(Config.wechat)
        this.wx_cryptor = new WXBizMsgCrypt(token, encodingAESKey, appid);

        yield next;
    };
};
