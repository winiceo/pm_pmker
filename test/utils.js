'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const mm = require('egg-mock');
const fixtures = path.join(__dirname, 'fixtures');
const eggPath = path.join(__dirname, '..');


const env = require('../config/environment');

const Redis = require('ioredis');

const execSync = require('child_process').execSync;


const mongoose = require('mongoose');

exports.getFilepath = name => {
    return path.join(fixtures, name);
};

exports.getJSON = name => {
    return JSON.parse(fs.readFileSync(exports.getFilepath(name)));
};

//清空缓存 及数据库
exports.initSystem = () => {

    execSync(`redis-cli -h ${env.get('REDIS_HOST')}  -p ${env.get('REDIS_PORT')} -n 1 "flushall"`);

    /* Connect to the DB */
    const promise = new Parse.Promise();
    mongoose.connect(env.get('PARSE_SERVER_DATABASE_URI'), function (err) {
        /* Drop the DB */
        const a = mongoose.connection.db.dropDatabase();
        promise.resolve(a);


    });
    return promise

};
