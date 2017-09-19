'use strict';
const fs = require('fs');
const path = require('path');
const deepmerge = require('deepmerge');
module.exports = appInfo => {


    const root = [
        path.join(appInfo.baseDir, 'app/view'),
        // path.join(appInfo.baseDir, 'app/view2'),
    ];
    const config = {
            keys: '71an',
            development: {
                watchDirs: ['app', 'config', 'conf', 'index.js', 'node_modules', 'egg-wechat'],
            },
            siteFile: {
                '/favicon.ico': fs.readFileSync(path.join(appInfo.baseDir, 'app/web/asset/images/favicon.ico'))

            },
            static: {
                prefix: '/public',

                dir: [path.join(appInfo.baseDir, 'addons/'), path.join(appInfo.baseDir, 'public/')]
            },
            vuessr: {
                layout: path.join(appInfo.baseDir, 'app/web/view/layout.html'),
                injectRes: [
                    // {
                    //  inline: true,
                    //  url: path.join(app.baseDir, 'app/web/framework/inject/inline.js')
                    // },
                    // {
                    //  inline: true,
                    //  manifest: true,
                    //  url: 'pack/inline.js'
                    // }
                ]
            },
            security: {
                csrf: {
                    enable: false,
                },
            },
            view: {
                root: [
                    path.join(appInfo.baseDir, 'app/view'),
                    path.join(appInfo.baseDir, 'addons'),
                ].join(','),
                ext: 'html',
                cache: false,
                defaultExt: '.html',
                mapping: {
                    '.ejs': 'ejs',
                    '.nj': 'nunjucks',
                    '.html': 'nunjucks',
                },
            },
            logrotator: {
                filesRotateBySize: [], // 需要按大小切割的文件，其他日志文件仍按照通常方式切割
                maxFileSize: 1 * 1024 * 1024, // 限制单个日志最大文件为1M，这是因为UAE上面显示最多只能是1M大小的数据
                maxFiles: 10, // 按大小切割时，文件最大切割的分数
                maxDays: 31, // 默认保存一个月的数据
                rotateDuration: 60000, // 按大小切割时，文件扫描的间隔时间
            },
            bodyParser: {
                formLimit: '1024kb',
                jsonLimit: '1024kb',
            },
            jwt: {
                secret: 'leven008',
                option: {
                    expiresIn: '1d',
                },
            },
            session: {
                key: '71an',
                maxAge: 24 * 3600 * 1000, // 1 天
                httpOnly: true,
                encrypt: true,
            },

            // notfound: {
            //     pageUrl: '/404',
            // },
            // onerror: {
            //     // 线上环境打开
            //     errorPageUrl: '/500',
            // },


            middleware: ['errorHandler','savesession'],
            errorHandler: {
                // 非 `/api/` 路径不在这里做错误处理，留给默认的 onerror 插件统一处理
                match: '/api',
            },
            host: {
                host: {
                    'bpwall:71an.com': '127.0.0.1',
                },
                mode: 'both', // `agent`,`worker`,`both`
            },
            io: {

                namespace: {
                    '/': {
                        connectionMiddleware: ['conn'],
                        packetMiddleware: ['handle']
                    },
                    '/lottery': {
                        connectionMiddleware: ['conn'],
                        packetMiddleware: ['handle']
                    }
                }
            },
            cors: {
                origin: '*',
                allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH'
            }

        }
    ;


    return deepmerge(config, require('./app.config.js'));


}
;
