'use strict';

module.exports = {
    get isXHR() {

        return this.request.get('X-Requested-With') === 'XMLHttpRequest';
    },
    success(params) {
       return this.render('genv/common/message.html',params)
    },
    error(params){
        return  this.render('genv/common/message.html',params)
    }
};
