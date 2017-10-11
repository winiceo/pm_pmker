'use strict';

const testData = {}

//管理员下单
describe('test/controller/user.test.js', () => {
    let app;
    const data = {};
    let account = {};
    let bpwall = {};
    let bpwall_id = '';
    let user = {};
    let order = {};

    before(function*() {

        app = mm.app();
        yield app.ready();
        const ctx = app.mockContext();
        const settingQuery = new Parse.Query('setting');
        let setData = yield ctx.service.data.setting()
        yield settingQuery.first().then(function (setting) {
            if (_.isEmpty(setting)) {
                const ss = new Parse.Object('setting');

                return ss.save(setData);
            }


        })

        const accountQuery = new Parse.Query('account');

        let mobile = "15810042722"
        accountQuery.equalTo('username', mobile);
        //userQuery.equalTo('openid', '1234567890');
        accountQuery.include('bpwall')
        let flat = false

        yield accountQuery.first().then(function (account) {
            //console.log(account)
            if (_.isEmpty(account)) {
                const accountData = {
                    username: mobile,
                    password: '123456',
                    bar_name: 'ABC',
                    money:0,
                };
                flat = true;
                const account = new Parse.Object('account');
                account.set(accountData);
                return account.save();
            }
            return Parse.Promise.as(account)
        }).then(function (account) {
            console.log(account)
            testData.account = account
            if (!flat) {
                testData.bpwall = account.get("bpwall")

            }
        })
        if (flat) {
            let dt = yield ctx.service.system.create_bpwall({account_id: testData.account.id});
            testData.bpwall = dt.account.get("bpwall")
            yield ctx.service.bpwall.get(testData.bpwall.id)

        }


    });
    before(function*() {
        // 创建发红包用户
        yield app.ready();
        const ctx = app.mockContext();
        const userQuery = new Parse.Query('wechat_user');
        let openid = "admin"
        let username = "管理员"
        userQuery.equalTo('openid', openid);

        yield userQuery.first().then(function (user) {
            if (_.isEmpty(user)) {
                const userData = {

                    openid: openid,
                    nickname: username,
                    sex: 2,
                    activetime: '1476702424',
                    province: '',
                    city: '',
                    country: '冰岛',
                    headimgurl: 'http://wx.qlogo.cn/mmopen/PiajxSqBRaEJUFibngUp1uZQiajTvBicAs98g0VjN9y2x11piaKYQa4CibriaRBLWCDFMVz9TSg33DXKdesMwGfkvAbwg/0',
                    mobile: '',
                    name: '',
                    money: 1000000,
                    last_activity: '0',
                };
                const wuser = new Parse.Object('wechat_user');
                wuser.set(userData);
                return wuser.save();


            }
            return Parse.Promise.as(user)

        }).then(function (user) {
            testData.user = user
        })

        const bpwall_id = testData.bpwall.id;

        //yield ctx.service.system.addAdmin(testData.bpwall.id, testData.user.id);

        //const Admins = yield ctx.service.admin.initAdmins(bpwall_id);
        //console.log(Admins)


    });




    // 订单相关测试
    describe('controller/wechat.test.js', () => {

        it('钱宝已登录用户', function*() {

            const ctx = app.mockContext();

            app.mockSession({
                user_id: testData.user.id,
            });
            //console.log(ctx.serssion)
            //yield app.redis.hincrby('money', user.objectId, -12);

            yield request(app.callback())
                .get(`/wechat/myredpack`)

                .expect(res => {
                     console.log(res.text);

                    // assert(res.body.code == 1);
                    // console.log(res)
                    // res.text.should.be.exactly('Redirecting to <a href="/manager">/manager</a>.');
                })
                .expect(200);




        });

        it('钱宝未登录用户', function*() {

            const ctx = app.mockContext();
            app.mockSession({
                user_id: 'testData.user.id',
            });

            console.log(ctx.serssion)
            //yield app.redis.hincrby('money', user.objectId, -12);

            yield request(app.callback())
                .get(`/wechat/myredpack`)

                .expect(res => {
                    console.log(res.text);

                    // assert(res.body.code == 1);
                    // console.log(res)
                    // res.text.should.be.exactly('Redirecting to <a href="/manager">/manager</a>.');
                })
                .expect(302);

            //


        });


        // it('微信回调', function*() {
        //
        //     const ctx = app.mockContext();
        //
        //     app.mockSession({
        //         user_id: testData.user.id,
        //     });
        //     let types=['text','ds','bp','el','ds']
        //     //let types=['ds','ds']
        //     const type = types[Random.natural(0, types.length - 1)];
        //     const data =  yield ctx.service.test.getData(type, testData.bpwall.id);
        //     console.log(data);
        //     //yield app.redis.hincrby('money', user.objectId, -12);
        //
        //     yield request(app.callback())
        //         .post(`/api/sendmsg/${type}/${testData.bpwall.id}`)
        //         .send(data)
        //         .expect(res => {
        //             //console.log(res.text);
        //
        //             // assert(res.body.code == 1);
        //             // console.log(res)
        //             // res.text.should.be.exactly('Redirecting to <a href="/manager">/manager</a>.');
        //         })
        //         .expect(200);
        //
        //
        //
        //
        // });




    });
});
