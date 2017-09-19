


module.exports = app => {
    app.get('/pmker/home', 'pmker.make.home');
    app.get('/pmker/mine', 'pmker.make.mine');
    app.get('/pmker/mine/:id', 'pmker.make.mine');
    app.get('/pmker/hot', 'pmker.make.hot');

    app.get('/pmker/make/article', 'pmker.article.create');
    app.get('/pmker/article/view/:id', 'pmker.article.view');
    app.get('/pmker/article/comment/:id', 'pmker.article.comment');

    //下载微信图片
    app.post('/pmker/api/download', 'pmker.api.download');

    app.post('/pmker/api/article/save', 'pmker.article.save');
    app.post('/pmker/api/comment/save', 'pmker.comment.save');


    app.get('/pmker/mine/article','pmker.mine.article')
};