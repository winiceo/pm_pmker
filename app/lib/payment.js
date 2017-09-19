'use strict';

const md5 = require('md5');
const sha1 = require('sha1');
const urllib = require('urllib');
const _ = require('underscore');
const xml2js = require('xml2js');
const https = require('https');
const url_mod = require('url');
const thunkify = require('thunkify');

const signTypes = {
  MD5: md5,
  SHA1: sha1,
};

const RETURN_CODES = {
  SUCCESS: 'SUCCESS',
  FAIL: 'FAIL',
};

const URLS = {
  UNIFIED_ORDER: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
  ORDER_QUERY: 'https://api.mch.weixin.qq.com/pay/orderquery',
  REFUND: 'https://api.mch.weixin.qq.com/secapi/pay/refund',
  REFUND_QUERY: 'https://api.mch.weixin.qq.com/pay/refundquery',
  DOWNLOAD_BILL: 'https://api.mch.weixin.qq.com/pay/downloadbill',
  SHORT_URL: 'https://api.mch.weixin.qq.com/tools/shorturl',
  CLOSE_ORDER: 'https://api.mch.weixin.qq.com/pay/closeorder',
};

const Payment = function(config) {
  this.appId = config.appId;
  this.partnerKey = config.partnerKey;
  this.mchId = config.mchId;
  this.subMchId = config.subMchId;
  this.notifyUrl = config.notifyUrl;
  this.passphrase = config.passphrase || config.mchId;
  this.pfx = config.pfx;
  return this;
};

Payment.prototype.getBrandWCPayRequestParams = function* getBrandWCPayRequestParams(order) {
  const default_params = {
    appId: this.appId,
    timeStamp: this._generateTimeStamp(),
    nonceStr: this._generateNonceStr(),
    signType: 'MD5',
  };

  order = this._extendWithDefault(order, [
    'notify_url',
  ]);

  const data = yield this.unifiedOrder(order);

  const params = _.extend(default_params, {
    package: 'prepay_id=' + data.prepay_id,
  });

  params.paySign = this._getSign(params);

  if (order.trade_type == 'NATIVE') {
    params.code_url = data.code_url;
  }

  params.timestamp = params.timeStamp;
  delete params.timeStamp;

  return params;
};

Payment.prototype.getJsPayRequestParams = function* getJsPayRequestParams(prepayId) {
  const default_params = {
    appId: this.appId,
    timeStamp: this._generateTimeStamp(),
    nonceStr: this._generateNonceStr(),
    signType: 'MD5',
  };

  const params = _.extend(default_params, {
    package: 'prepay_id=' + prepayId,
  });

  params.paySign = this._getSign(params);

    // see: https://mp.weixin.qq.com/wiki?action=doc&id=mp1421141115&t=0.5826723026485408&token=&lang=zh_CN#wxzf1
  params.timestamp = params.timeStamp;
  delete params.timeStamp;

  return params;
};

/**
 * Generate parameters for `WeixinJSBridge.invoke('editAddress', parameters)`.
 *
 * @param  {String}   data.url  Referer URL that call the API. *Note*: Must contain `code` and `state` in querystring.
 * @param  {String}   data.accessToken
 *
 * @see https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=7_9
 */
Payment.prototype.getEditAddressParams = function* getEditAddressParams(data) {
  if (!(data.url && data.accessToken)) {
    const err = new Error('Missing url or accessToken');
    throw err;
  }

  const params = {
    appId: this.appId,
    scope: 'jsapi_address',
    signType: 'SHA1',
    timeStamp: this._generateTimeStamp(),
    nonceStr: this._generateNonceStr(),
  };
  const signParams = {
    appid: params.appId,
    url: data.url,
    timestamp: params.timeStamp,
    noncestr: params.nonceStr,
    accesstoken: data.accessToken,
  };
  const string = this._toQueryString(signParams);
  params.addrSign = signTypes[params.signType](string);

  return params;
};

Payment.prototype._httpRequest = function(url, data) {
  return urllib.request({
    url,
    method: 'POST',
    body: data,
  });
};

Payment.prototype._httpsRequest = function(url, data) {
  const parsed_url = url_mod.parse(url);

  return new Promise((resolve, reject) => {
    const req = https.request({
      host: parsed_url.host,
      port: 443,
      path: parsed_url.path,
      pfx: this.pfx,
      passphrase: this.passphrase,
      method: 'POST',
    }, function(res) {
      let content = '';
      res.on('data', function(chunk) {
        content += chunk;
      });
      res.on('end', function() {
        resolve(content);
      });
    });

    req.on('error', function(e) {
      reject(e);
    });
    req.write(data);
    req.end();
  });
};

Payment.prototype._signedQuery = function* _signedQuery(url, params, options) {
  const self = this;
  const required = options.required || [];
  params = this._extendWithDefault(params, [
    'appid',
    'mch_id',
    'sub_mch_id',
    'nonce_str',
  ]);

  params = _.extend({
    sign: this._getSign(params),
  }, params);

  if (params.long_url) {
    params.long_url = encodeURIComponent(params.long_url);
  }

  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null) {
      params[key] = params[key].toString();
    }
  }

  const missing = [];
  required.forEach(function(key) {
    const alters = key.split('|');
    for (let i = alters.length - 1; i >= 0; i--) {
      if (params[alters[i]]) {
        return;
      }
    }
    missing.push(key);
  });

  if (missing.length) {
    throw new Error('missing params ' + missing.join(','));
  }
  const request = (options.https ? this._httpsRequest : this._httpRequest).bind(this);
  const response = yield request(url, this.buildXml(params));

  const that = this;

  const parseString = thunkify(xml2js.parseString);
  let result = yield parseString(response, { explicitArray: false });
  result = result.xml;
  const err = that.check(result);
  if (err) {
    throw err;
  }
  return result;

};

Payment.prototype.unifiedOrder = function* unifiedOrder(params) {
  const requiredData = [ 'body', 'out_trade_no', 'total_fee', 'spbill_create_ip', 'trade_type' ];
  if (params.trade_type == 'JSAPI') {
    requiredData.push('openid');
  } else if (params.trade_type == 'NATIVE') {
    requiredData.push('product_id');
  }
  params.notify_url = params.notify_url || this.notifyUrl;

  return yield this._signedQuery(URLS.UNIFIED_ORDER, params, {
    required: requiredData,
    https: true,
  });
};

Payment.prototype.queryOrder = function* queryOrder(params) {
  return yield this._signedQuery(URLS.ORDER_QUERY, params, {
    required: [ 'transaction_id|out_trade_no' ],
  });
};

Payment.prototype.refund = function* refund(params) {
  params = this._extendWithDefault(params, [
    'op_user_id',
  ]);

  return yield this._signedQuery(URLS.REFUND, params, {
    https: true,
    required: [ 'transaction_id|out_trade_no', 'out_refund_no', 'total_fee', 'refund_fee' ],
  });
};

Payment.prototype.refundQuery = function* refundQuery(params) {
  return yield this._signedQuery(URLS.REFUND_QUERY, params, {
    required: [ 'transaction_id|out_trade_no|out_refund_no|refund_id' ],
  });
};

Payment.prototype.downloadBill = function* downloadBill(params) {
  return yield this._signedQuery(URLS.DOWNLOAD_BILL, params, {
    required: [ 'bill_date', 'bill_type' ],
  });
};

Payment.prototype.shortUrl = function* shortUrl(params) {
  return yield this._signedQuery(URLS.SHORT_URL, params, {
    required: [ 'long_url' ],
  });
};

Payment.prototype.closeOrder = function* closeOrder(params) {
  return yield this._signedQuery(URLS.CLOSE_ORDER, params, {
    required: [ 'out_trade_no' ],
  });
};

Payment.prototype.parseCsv = function(text) {
  const rows = text.trim().split(/\r?\n/);

  function toArr(rows) {
    const titles = rows[0].split(',');
    const bodys = rows.splice(1);
    const data = [];

    bodys.forEach(function(row) {
      const rowData = {};
      row.split(',').forEach(function(cell, i) {
        rowData[titles[i]] = cell.split('`')[1];
      });
      data.push(rowData);
    });
    return data;
  }

  return {
    list: toArr(rows.slice(0, rows.length - 2)),
    stat: toArr(rows.slice(rows.length - 2, rows.length))[0],
  };
};

Payment.prototype.buildXml = function(obj) {
  const builder = new xml2js.Builder();
  const xml = builder.buildObject({ xml: obj });
  return xml;
};

Payment.prototype.check = function(message) {

  let error = null;
  if (message.return_code == RETURN_CODES.FAIL) {
    error = new Error(message.return_msg);
    error.name = 'ProtocolError';
  } else if (message.result_code == RETURN_CODES.FAIL) {
    error = new Error(message.err_code);
    error.name = 'BusinessError';
  } else if (this.appId !== message.appid) {
    error = new Error();
    error.name = 'InvalidAppId';
  } else if (this.mchId !== message.mch_id) {
    error = new Error();
    error.name = 'InvalidMchId';
  } else if (this.subMchId && this.subMchId !== message.sub_mch_id) {
    error = new Error();
    error.name = 'InvalidSubMchId';
  } else if (this._getSign(message) !== message.sign) {
    error = new Error();
    error.name = 'InvalidSignature';
  }

  return error;
};


/**
 * 使用默认值扩展对象
 * @param  {Object} obj
 * @param  {Array} keysNeedExtend
 * @return {Object} extendedObject
 */
Payment.prototype._extendWithDefault = function(obj, keysNeedExtend) {
  const defaults = {
    appid: this.appId,
    mch_id: this.mchId,
    sub_mch_id: this.subMchId,
    nonce_str: this._generateNonceStr(),
    notify_url: this.notifyUrl,
    op_user_id: this.mchId,
  };
  const extendObject = {};
  keysNeedExtend.forEach(function(k) {
    if (defaults[k]) {
      extendObject[k] = defaults[k];
    }
  });
  return _.extend(extendObject, obj);
};

Payment.prototype._getSign = function(pkg, signType) {
  pkg = _.clone(pkg);
  delete pkg.sign;
  signType = signType || 'MD5';
  const string1 = this._toQueryString(pkg);
  const stringSignTemp = string1 + '&key=' + this.partnerKey;
  const signValue = signTypes[signType](stringSignTemp).toUpperCase();
  return signValue;
};

Payment.prototype._toQueryString = function(object) {
  return Object.keys(object).filter(function(key) {
    return object[key] !== undefined && object[key] !== '';
  }).sort().map(function(key) {
    return key + '=' + object[key];
  }).join('&');
};

Payment.prototype._generateTimeStamp = function() {
  return parseInt(+new Date() / 1000, 10) + '';
};

/**
 * [_generateNonceStr description]
 * @param  {[type]} length [description]
 * @return {[type]}        [description]
 */
Payment.prototype._generateNonceStr = function(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const maxPos = chars.length;
  let noceStr = '';
  let i;
  for (i = 0; i < (length || 32); i++) {
    noceStr += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return noceStr;
};

/**
 * Pay notify middleware for koa.
 *
 * first use co-wechat-body parse xml body
 *
 *  ```
 *  var wechatBodyParser = require('co-wechat-body');
 *  app.use(wechatBodyParser(options))
 *  ```
 *
 * then by koa-router:
 *
 *  ```
 *  router.post('/wechat/payment/notify', wechatPayment.middleware(), payNotifyChangeOrderStatus);
 *  ```
 */
Payment.prototype.middleware = function middleware() {
  const self = this;

  function success() {
    this.body = self.buildXml({
      return_code: 'SUCCESS',
      return_msg: 'OK',
    });
  }

  function fail(err) {
    if (typeof err === 'string') {
      err = new Error(err);
    }

    this.body = self.buildXml({
      return_code: 'FAIL',
      return_msg: err.message || err.name || '',
    });
  }

  return function* wechatPayNotify(next) {
        // 这里面的this指针指向的是 koa context
    if (this.method !== 'POST') {
      return fail.call(this, 'NotImplemented');
    }

        // through co-wechat-body parse middleware
    const body = this.request.body;

    if (!body) {
      return fail.call(this, 'Invalid body');
    }

    const err = self.check(body);
    if (err) {
      return fail.call(this, err);
    }

    this.reply = data => {
      if (data instanceof Error) {
        fail.call(this, data);
      } else {
        success.call(this, data);
      }
    };

        // order pay status deal by yourself.
    yield next;
  };
};

module.exports = Payment;

