'use strict';
const moment = require("moment")
const Parse = require("../../lib/parse")
const fs=require('fs')
module.exports = app => {
    class ApiController extends app.Controller {
        * download() {
            const {ctx, service} = this;
            const mediaid = ctx.request.body.mediaid;
            const api = this.ctx.helper.wechatApi();
            console.log(mediaid)
            // const data=  api.getMedia(mediaid, function(data){
            //     return data
            // });

            const promise = new Parse.Promise();

            api.getMedia(mediaid, function (err, data,res) {
                console.log(err)
                console.log(res)
                if (err) promise.reject(err);
                let dir=app.config.baseDir+"/public/pmker/article/"
                let filename=new Date().getTime()+".jpg"
                fs.writeFile( dir+filename,data, function(err){
                    if(err){
                        promise.reject(err);
                    }
                    promise.resolve(filename);
                })

            });
            let data=""
            try{
                  data= yield promise;
            }catch(e){
                  console.log(e)
            }


            const ret = {
                error: 0,
                url:app.config.baseUrl+"/public/pmker/article/"+data
            };

            console.log(ret)
              this.ctx.body=ret
        }


    }

    return ApiController;
}
;
