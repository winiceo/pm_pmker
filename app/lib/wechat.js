/**
 * Created by jks on 2017/4/3.
 */
'use strict';

const assert = require('assert');
const wechat = require('co-wechat');
const WechatApi = require('co-wechat-api');
const OAuth = require('co-wechat-oauth');
const Pay = require('co-wechat-payment');
const ONE_DAY = 1000 * 60 * 60 * 24;



function createWX(app) {
  const config=app.config.wechat
  assert(config.appid, '[egg-wechat] appid is required on config');
  app.coreLogger.info('[egg-wechat] init %s', config.appid);

  const name = config.redis;
  const store = {};

  const redis = (name ? app.redis.get(name) : app.redis) || {
    get(key, callback) {
      if (callback) {
        callback(null, store[key]);
      }
    },
    set(key, data, callback) {
      store[key] = data;
      if (callback) {
        callback(null);
      }
    },
    del(key, callback) {
      delete store[key];
      if (callback) {
        callback(null);
      }
    },
  };

  const CacheStore = {
    // 根据key从缓存中获取数据
    * get(key) {
      const res = yield redis.get(key);
      if (!res) return null;
      return JSON.parse(res);
    },

    // 向缓存中写入数据
    * set(key, value, maxAge) {
      maxAge = maxAge || ONE_DAY;
      value = JSON.stringify(value);
      yield redis.set(key, value, 'PX', maxAge);
    },

    // 从缓存中删除数据
    * destroy(key) {
      yield redis.del(key);
    },
  };

  Object.assign(CacheStore, {
    // 获取accessToken
    * getToken() {
      return yield CacheStore.get('access-token');
    },

    // 保存accessToken
    * saveToken(token) {
      yield CacheStore.set('access-token', token);
    },

    // 获取TicketToken
    * getTicketToken(type) {
      return yield CacheStore.get('ticket-token' + type);
    },

    // 保存TicketToken
    * saveTicketToken(type, token) {
      yield CacheStore.set('ticket-token' + type, token);
    },

    // 获取OAuthToken
    * getOAuthToken(openid) {
      return yield CacheStore.get('oauth-' + openid);
    },

    // 保存OAuthToken
    * saveOAuthToken(openid, token) {
      let ttl = 0;
      if (token && token.expires_in && token.expires_in > 10) {
        ttl = token.expires_in - 10;
      }
      yield CacheStore.set('oauth-' + openid, token, ttl);
    },
  });

  const cache = app.cacheStore = CacheStore;
  // 初始化WechatAPI
  const api = new WechatApi(config.appid, config.appsecret, cache.getToken, cache.saveToken);
  api.registerTicketHandle(cache.getTicketToken, cache.saveTicketToken);
  // 初始化OAuthAPI
  const oauth = new OAuth(config.appid, config.appsecret, cache.getOAuthToken, cache.saveOAuthToken);
  // 初始化支付API
  const payment = new Pay({
    appId: config.appid,
    partnerKey: config.pay.partnerKey,
    mchId: config.pay.mchId,
    subMchId: config.pay.subMchId,
    notifyUrl: config.pay.notifyUrl,
    passphrase: config.pay.passphrase || config.pay.mchId,
    pfx: config.pay.pfx,
  });

  const wx = app.wx = app.wechat = {
    api,
    oauth,
    payment,
    middleware: new wechat({
      appid: config.appid,
      appsecret: config.appsecret,
      token: config.token,
      encodingAESKey: config.encodingAESKey,
    }).middleware,
  };

  return wx;
}
module.exports = createWX