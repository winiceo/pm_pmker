/**
 * Created by leven on 17/2/20.
 */


const xmlParser = require('../lib/xml-parser');

module.exports = (options, app) => {
    return function* checkid(next) {

        // 后续中间件执行完成后将响应体转换成 gzip
        // /const {ctx, service} = this;

        // console.log(app==this)
        const bpwall_id = this.params.id;
        let bpwall = yield app.redis.hget('bpwalls', bpwall_id);

        if (!bpwall) {
            yield this.service.task.cache_bpwall({bpwall_id: bpwall_id})
            bpwall = yield app.redis.hget('bpwalls', bpwall_id);
            if (!bpwall) {
                return this.redirect('/500?error=id_fail');
            }

        }
        yield next;
    };
};
