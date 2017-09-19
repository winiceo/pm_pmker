'use strict';

const Parse = require('../../lib/parse');
const _ = require('lodash')
module.exports = app => {
    class homeController extends app.Controller {

        * index() {


            const result = yield app.mysql.get('ims_leven_ds_account', {
                id: 15,
            });
            this.ctx.body = result;
        }

        * test() {
 

            this.ctx.body =   yield this.service.code.get()

        }

        * notFound() {
            this.ctx.status = 404;
            yield this.ctx.render('page/404.html');
        }

        * error() {

            app.logger.info(this.session)
            //this.ctx.session.user_id=null
            yield this.ctx.render('genv/page/500.html');
        }


    }

    return homeController;
};



