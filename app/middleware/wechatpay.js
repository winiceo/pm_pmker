/**
 * Created by leven on 17/2/20.
 */


const env = require('../../config/environment');

const wechatPay = require('../lib/payment');
const fs = require('hexo-fs');

module.exports = (options, app) => {


  const initConfig = {
    partnerKey: env.get('WECHAT_PAY_KEY'),
    appId: env.get('WECHAT_APPID'),
    mchId: env.get('WECHAT_PAY_MID') + '',
    notifyUrl: env.get('BASE_URL')+'/api/pay/notify',
    pfx: fs.readFileSync(app.config.certpfx),
  };
  const wxpay = new wechatPay(initConfig);

  return wxpay;


};

