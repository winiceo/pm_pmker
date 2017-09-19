/**
 * Created by leven on 17/2/10.
 */

const K = require('parse/node');

const env = require('../../config/environment');

console.log(env.get('PARSE_SERVER_URL'));
K.initialize(env.get('PARSE_SERVER_APPLICATION_ID'), env.get('PARSE_SERVER_MASTER_KEY'));
K.serverURL = env.get('PARSE_SERVER_URL');


module.exports = K;
