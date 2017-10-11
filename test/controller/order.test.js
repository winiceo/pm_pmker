'use strict';


const testData = {}


describe('test/controller/order.test.js', () => {
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
            console.log(account)
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
        let openid = "12345678"
        let username = "张三发"
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
            testData.userred = user
        })


    });


    before(function*() {
        // 创建抢红包用户
        yield app.ready();
        const ctx = app.mockContext();
        const userQuery = new Parse.Query('wechat_user');
        let openid = "123456789"
        let username = "李四抢"
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


    });

    // 订单相关测试
    describe('service/order.test.js', () => {


        it('文本消息', function*() {

            const ctx = app.mockContext();

            app.mockSession({
                user_id: testData.user.id,
            });

            const type = "text";
            const data =  yield ctx.service.test.getData(type, testData.bpwall.id);
            console.log(data);
            //yield app.redis.hincrby('money', user.objectId, -12);

            yield request(app.callback())
                .post(`/api/sendmsg/${type}/${testData.bpwall.id}`)
                .send(data)
                .expect(res => {
                    console.log(res.body);

                      assert(res.body.code == 1);
                    // console.log(res)
                    // res.text.should.be.exactly('Redirecting to <a href="/manager">/manager</a>.');
                })
                .expect(200);




        });
        it('下订单霸屏', function*() {

            const ctx = app.mockContext();

            app.mockSession({
                user_id: testData.user.id,
            });
            let types=['el','ds','bp','el']
            const type = types[Random.natural(0, types.length - 1)];
            const data =  yield ctx.service.test.getData(type, testData.bpwall.id);
            console.log(data);
            //yield app.redis.hincrby('money', user.objectId, -12);

            yield request(app.callback())
                .post(`/api/sendmsg/${type}/${testData.bpwall.id}`)
                .send(data)
                .expect(res => {
                    console.log(res.text);

                    // assert(res.body.code == 1);
                    // console.log(res)
                    // res.text.should.be.exactly('Redirecting to <a href="/manager">/manager</a>.');
                })
                .expect(302);




        });
        it('模拟消息通知', function*() {

            const ctx = app.mockContext();

            const query = new Parse.Query('order');
            query.equalTo('bpwall_id', testData.bpwall.id);
            query.descending('createdAt');

            order=yield query.first()


            app.mockSession({
                user_id: user.objectId,
            });

            order = order.toJSON();

            const xml = `<xml>
                    <appid><![CDATA[wx21d2aa4dcb00895f]]></appid>
                    <attach><![CDATA[{"oid":"${order.objectId}"}]]></attach>
                    <bank_type><![CDATA[CFT]]></bank_type>
                    <cash_fee><![CDATA[${order.money}]]></cash_fee>
                    <fee_type><![CDATA[CNY]]></fee_type>
                    <is_subscribe><![CDATA[Y]]></is_subscribe>
                    <mch_id><![CDATA[1411503102]]></mch_id>
                    <nonce_str><![CDATA[iWv3EpLIpQ9MImgqvqpTO9NV49ddNoms]]></nonce_str>
                    <openid><![CDATA[og54Btzs5Iwp403MVgjCbiDUzru0]]></openid>
                    <out_trade_no><![CDATA[qahd_${order.objectId}]]></out_trade_no>
                    <result_code><![CDATA[SUCCESS]]></result_code>
                    <return_code><![CDATA[SUCCESS]]></return_code>
                    <sign><![CDATA[B5714DA1543E9E9C3BA6F3BF5B749C07]]></sign>
                    <time_end><![CDATA[20170302014224]]></time_end>
                    <total_fee>${order.money}</total_fee>
                    <trade_type><![CDATA[JSAPI]]></trade_type>
                    <transaction_id><![CDATA[4000652001201703021867188716]]></transaction_id>
                </xml>`;


            // console.log(ctx.session.user_id)
            yield request(app.callback())
                .post('/test/notify')
                .set('Content-Type', 'application/xml')
                .set('Accept', 'application/xml')
                // .expect('Content-Type', /xml/)
                .send(xml)
                .expect(res => {
                    console.log(res.text);
                    // assert(_.startsWith(res.text,'Redirecting to <a href=\"/order/pay/?oid='))

                    // res.text.should.be.exactly('Redirecting to <a href="/manager">/manager</a>.');
                })
                .expect(200);
            yield app.runSchedule('task');

        });

        it('创建账单', function*() {


            const ctx = app.mockContext();

            yield app.runSchedule('task');

            // const data = yield ctx.service.finance.task_create_bill({order_id: order.objectId});
            // console.log(data);
            // assert(data == 20000);
            yield testData.account.fetch();


            const billQuery = new Parse.Query('finance');
            billQuery.descending('creatAt');
            billQuery.equalTo('bpwallId', testData.bpwall.id);


            const moneys = yield billQuery.find()
            let countBill = 0
            moneys.map(money=> {

                    countBill = countBill + (money.get("money"))

            })

            assert(testData.account.get('money')===countBill)

        });


    });
});
