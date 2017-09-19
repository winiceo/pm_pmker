'use strict';

const assert = require('assert');
const Redis = require('ioredis');
const _ = require('lodash');
const isJSON = require('is-json');
const utils = require('./utils');
const is = require('is-type-of');

Redis.Command.setArgumentTransformer('hmset', function(args) {
  if (args.length === 2) {
    if (typeof Map !== 'undefined' && args[1] instanceof Map) {
      // utils is a internal module of ioredis
      return [ args[0] ].concat(utils.convertMapToArray(args[1]));
    }
    if (typeof args[1] === 'object' && args[1] !== null) {
      args[1] = _.mapValues(args[1], function(n) {

        return (is.array(n) || is.object(n)) ? JSON.stringify(n) : n;
      });

      return [ args[0] ].concat(utils.convertObjectToArray(args[1]));
    }
  }
  return args;
});

Redis.Command.setReplyTransformer('hgetall', function(result) {

  if (Array.isArray(result)) {
    const obj = {};
    for (let i = 0; i < result.length; i += 2) {
      obj[result[i]] = isJSON(result[i + 1]) ? JSON.parse(result[i + 1]) : result[i + 1];
    }
    return obj;
  }
  return result;
});
Redis.Command.setArgumentTransformer('hset', function(args) {

  if (args.length === 3) {
    if (typeof args[2] === 'object' && args[2] !== null) {
      args[2] = JSON.stringify(args[2]);
    }
  }
  return args;
});

Redis.Command.setReplyTransformer('hget', function(result) {

  result = isJSON(result) ? JSON.parse(result) : result;

  return result;
});

module.exports = app => {
  app.addSingleton('redis', createClient);
};

let count = 0;

function createClient(config, app) {
  let client;

  if (config.cluster === true) {
    assert(config.nodes && config.nodes.length !== 0, '[egg-redis] cluster nodes configuration is required when use cluster redis');

    config.nodes.forEach(client => {
      assert(client.host && client.port && client.password !== undefined && client.db !== undefined,
        `[egg-redis] 'host: ${client.host}', 'port: ${client.port}', 'password: ${client.password}', 'db: ${client.db}' are required on config`);
    });
    app.coreLogger.info('[egg-redis] cluster connecting start');

    client = new Redis.Cluster(config.nodes, config);
    client.on('connect', function() {
      app.coreLogger.info('[egg-redis] cluster connect success');
    });
    client.on('error', function(error) {
      app.coreLogger.error(error);
    });
  } else {
    assert(config.host && config.port && config.password !== undefined && config.db !== undefined,
      `[egg-redis] 'host: ${config.host}', 'port: ${config.port}', 'password: ${config.password}', 'db: ${config.db}' are required on config`);

    app.coreLogger.info('[egg-redis] connecting redis://:%s@%s:%s/%s',
      config.password, config.host, config.port, config.db);

    client = new Redis(config);
    client.on('connect', function() {
      app.coreLogger.info('[egg-redis] connect success on redis://:%s@%s:%s/%s',
        config.password, config.host, config.port, config.db);
    });
    client.on('error', function(error) {
      app.coreLogger.error(error);
    });
  }

  app.beforeStart(function* () {
    const result = yield client.time();
    const index = count++;
    app.coreLogger.info(`[egg-redis] instance[${index}] status OK, redis currentTime: ${result[0]}`);
  });

  return client;
}
