const env = require('./environment');
// console.log(env.all())
module.exports = {
    baseUrl: env.get('BASE_URL'),
    appURL: env.get('BASE_URL'),
    ossURL: env.get('ALI_OSS_HOST'),
    certpfx: __dirname + '/apiclient_cert.p12',
    shareimg: `${env.get('ALI_OSS_HOST')}/static/share/share.png`,
    // logger: {
    //     dir: env.get('LOGS'),
    // },
    wechat: {
        token: env.get('WECHAT_TOKEN'),
        appid: env.get('WECHAT_APPID'),
        encodingAESKey: env.get('WECHAT_ENCODINGAESKEY'),
        appsecret: env.get('WECHAT_APPSECRET'),

        pay: {
            partnerKey: '33',
            mchId: '33',
            notifyUrl: '',
            pfx: ''
        },
    },
    parse: {
        app_id: env.get('PARSE_SERVER_APPLICATION_ID'),
        master_key: env.get('PARSE_SERVER_MASTER_KEY'),
        server_url: env.get('PARSE_SERVER_URL'),
    },
    redis: {
        client: {
            host: env.get('REDIS_HOST'),
            port: env.get('REDIS_PORT'),
            password: env.get('REDIS_PASSWORD'),
            db: parseInt(env.get('REDIS_DB')) + '' || '0',
        },
        agent: true,
    },
    mysql: {
        // 单数据库信息配置
        client: {
            // host
            host: env.get('MYSQL_HOST'),
            // 端口号
            port: env.get('MYSQL_PORT'),
            // 用户名
            user: env.get('MYSQL_USER'),
            // 密码
            password: env.get('MYSQL_PASSWORD'),
            // 数据库名
            database: env.get('MYSQL_DATABASE'),
        },

        // 是否加载到 app 上，默认开启
        app: true,
        // 是否加载到 agent 上，默认关闭
        agent: false,
    },
    env,
}
;
