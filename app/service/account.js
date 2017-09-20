'use strict';
const _ = require('lodash');
const Parse = require('../lib/parse');
module.exports = app => {

    class AccountService extends app.Service {
        constructor(ctx) {
            super(ctx);


        }


        format(account) {

            const token = app.jwt.sign({
                accountId: account.id,
                team: account.get('team')
            }, app.config.jwt.secret, { expiresIn: '7d' });

            account.set('token', token);


            return account.toJSON();
        }


    }

    return AccountService;
};
