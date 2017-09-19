const habitat = require('habitat');

const file = process.env.NODE_ENV == 'production' ? '../../.env' : '../.env';

habitat.load(require('path').resolve(__dirname, file));
const env = new habitat();

module.exports = env;
