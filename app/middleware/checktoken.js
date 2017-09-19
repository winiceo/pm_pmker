/**
 * Created by leven on 17/2/20.
 */

module.exports = (options, app) => {
    return function* checkid(next) {

        // 后续中间件执行完成后将响应体转换成 gzip
        const options={}
        const ret={}
        let token="";
        if(this.request.headers['authorization']){
            var strToken=this.request.headers['authorization'].split(' ');
            if(strToken.length==2){
                token=strToken[1]
            }
        }else {
            token = this.query.token|| this.request.body.token  || this.request.headers['x-token'];
        }
        // if(!token){
        //     token=this.cookies
        // }
        options.token=token;
        let user=false;
        try{
            user = app.jwt.verify(token, app.config.jwt.secret);
            if(user){
                this.user=user;
            }
        }catch(e){

        }
        if(!user){

            if(this.isXHR){
                return this.body={
                    code:403,
                    message:'认证失败，请重新登录'
                }
            }else{
               return this.redirect('/cms/login')
            }
        }

        yield next;
    };
};
