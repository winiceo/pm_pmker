'use strict';
const _ = require('lodash');
const Parse = require('../lib/parse');
const moment = require('moment');
module.exports = app => {
    /** 
     */
    class TeamService extends app.Service {
        constructor(ctx) {
            super(ctx);

        }

        * get(team) {
            const query = new Parse.Query('team');
            query.equalTo('objectId', team);

            return yield query.get(team);
        }

        * create(options) { 
            const Team = Parse.Object.extend('team');
            const team = new Team();
            team.set(options);  

            return yield team.save();
        }
 


    }

    return TeamService;
};
