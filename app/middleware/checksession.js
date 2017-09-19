/**
 * Created by leven on 17/2/20.
 */


const xmlParser = require('../lib/xml-parser');
const _ = require('lodash')
module.exports = (options, app) => {
    return function* checksession(next) {

        const bpwall_id = this.params.id;

        if (_.isEmpty(this.session) || !this.session.user_id) {

            return this.redirect(`/app/${bpwall_id}`);
        }else{
            const user_info=yield this.service.user.info(this.session.user_id)

            if(user_info==null){
                return this.redirect(`/app/${bpwall_id}`);

            }
        }

        yield next;

    };
};
