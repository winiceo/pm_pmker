'use strict';

const mm = require('egg-mock');

global.mm = global.mock = mm;
global.request = require('supertest');
global.assert = require('assert');
global.Parse = require('../app/lib/parse');
global._ = require('lodash');

global.Mock = require('mockjs');
global.Random = Mock.Random;
global.is = require('is-type-of');
global.isJSON = require('is-json');

global.utils = require('./utils');

let app;
before(() => {
  app = global.app = mm.app();
  return app.ready();
});

after(() => app.close());
