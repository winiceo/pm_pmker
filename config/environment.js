const habitat = require('habitat');
console.log("fuck")
console.log(process.env.NODE_ENV)
const file = process.env.NODE_ENV == 'production' ? '../../.env' : '../.env';

habitat.load(require('path').resolve(__dirname, file));
const env = new habitat();

module.exports = env;
