'use strict';

// const execSync = require('child_process').execSync;

// execSync('redis-cli "flushall"');
// execSync('mysql -uroot test < test/table.sql');
// console.log('create table success');
const env = require('../config/environment');
const Parse = require('../app/lib/parse');

const Redis = require('ioredis');

const execSync = require('child_process').execSync;

execSync(`redis-cli -h ${env.get('REDIS_HOST')}  -p ${env.get('REDIS_PORT')} -n 1 "flushall"`);


const mongoose = require('mongoose');
/* Connect to the DB */
const promise = new Parse.Promise();
mongoose.connect(env.get('PARSE_SERVER_DATABASE_URI'), function(err) {
    /* Drop the DB */
  const a = mongoose.connection.db.dropDatabase();
  promise.resolve(a);


});

