// const Model = require('../../mocks/article/list');
//
// exports.index = function* (ctx) {
//    ctx.body={success:ctx.session};
//    //yield ctx.render('index/index.js', Model.getPage(1, 10));
// };
//
// exports.client = function* (ctx) {
//   yield ctx.renderClient('index/index.js', Model.getPage(1, 10));
// };
//
// exports.element = function* (ctx) {
//   yield ctx.render('element/element.js', Model.getPage(1, 10));
// };
//
// exports.pager = function* (ctx) {
//   const pageIndex = ctx.query.pageIndex;
//   const pageSize = ctx.query.pageSize;
//   ctx.body = Model.getPage(pageIndex, pageSize);
// };
'use strict';


'use strict';

module.exports = app => {
    class homeController extends app.Controller {

        * index() {

            yield this.ctx.render('admin/index.html');
        }




    }
    return homeController;
};



