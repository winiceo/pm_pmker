'use strict';
 
const Parse = require('../lib/parse');
module.exports = app => {

    class CodeService extends app.Service {
        constructor(ctx) {
            super(ctx);
            

        }

        /**
         *获取活动信息
         * @param pageid
         * @returns {*}
         */

        * get() {
            
                const query = new Parse.Query('code');
                 
               
                return yield query.first().then(function (page) {


                    if (page) {
                        page.increment('code',Math.round(Math.random() * 10)+1)
                        return page.save();
                        
                    }else{
                          const Code = Parse.Object.extend('code');
                          const code = new Code();
                          code.set('code',10000)
                          return code.save()
                          
                    }
                    

                }).then(function(code){
                    return code.get('code')
                }, function (err) {
                    app.logger.error(err);
                    return Math.round(Math.random() * 9000000);

                });

            
        }
 


    }

    return CodeService;
};
