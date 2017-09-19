exports.static = true;
exports.logrotator = true;
exports.i18n = true;
exports.development = true;

exports.session = true;

exports.vue = {
  enable: false,
  package: 'egg-view-vue'
};

exports.vuessr = {
  enable: false,
  package: '../egg-view-vue-ssr'
};
exports.jwt = {
    enable: true,
    package: 'egg-jwt',
};
exports.redis = {
    enable: true,
    package: '../egg-redis',
};

exports.nunjucks = {
    enable: true,
    package: 'egg-view-nunjucks',
};

exports.security = {
    csrf: {
        enable: false,
    },
};

exports.io = {
    enable: false,
    package: 'egg-socket.io',
};
exports.cors = {
    enable: true,
    package: 'egg-cors',
};

exports.mysql = {
    enable: false,
    package: 'egg-mysql',
};
exports.wechat = {
    enable: true,
    package: '../egg-wechat',
};