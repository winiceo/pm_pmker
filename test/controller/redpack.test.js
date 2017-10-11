'use strict';



const testData = {}


describe('test/controller/redpack.test.js', () => {
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
        let openid = "fa12345678"
        let username = "发红包了"
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


    before(function*() {
        // 创建抢红包用户
        yield app.ready();
        const ctx = app.mockContext();
        const userQuery = new Parse.Query('wechat_user');
        let openid = "qian123456789"
        let username = "我抢"
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
                    money: 0,
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
    after(function*() {
        // 清空测试数据
        // yield bpwall.destroy()
        // yield account.destroy()


    });
    afterEach(mock.restore);

    // 订单相关测试
    describe('service/sendredpack.test.js', () => {
        it('钱宝发红包', function*() {
            console.log(testData)
            const ctx = app.mockContext();
            app.mockSession({
                user_id: testData.user.id,
            });
            const type = 'rp';
            const data = Mock.mock({
                // 属性 id 是一个自增数，起始值为 1，每次增 1
                num: Random.natural(6, 20),
                money: Random.natural(10, 100),
                content: 'id:' + Mock.mock('@csentence'),
                desk_name: Mock.mock('@csentence'),
                payWay: 1,

            });
            console.log(data);
            //yield app.redis.hincrby('money', user.objectId, -12);

            yield request(app.callback())
                .post(`/api/sendmsg/${type}/${testData.bpwall.id}`)
                .send(data)
                .expect(res => {
                    console.log(res.body);

                    // assert(res.body.code == 1);
                    // console.log(res)
                    // res.text.should.be.exactly('Redirecting to <a href="/manager">/manager</a>.');
                })
                .expect(200);

            console.log("当前余额：%s,扣除余额，%s", testData.user.get('money'), testData.user.get('money') - data.money * 100)

            let money = testData.user.get('money') - data.money * 100;
            yield testData.user.fetch().then(function (user) {
                assert(user.get('money') == money)
            })


        });

        it('用户钱宝订单审核，金额应该一致', function*() {

            const ctx = app.mockContext();
            app.mockSession({
                user_id: testData.user.id,
            });
            const moneys = yield ctx.service.money.getList(ctx.session.user_id);
            let count = 0
            moneys.map(money=> {
                count = count + money.get("money")
            })

            testData.count = count
            assert((testData.user.get('money')+count)==1000000)
            console.log((testData.user.get('money') + count))


        });
        it('红包审核', function*() {

            const ctx = app.mockContext();
            app.mockSession({
                user_id: testData.user.id,
            });

            const billQuery = new Parse.Query('UserBill');
            billQuery.descending('creatAt');
            billQuery.equalTo('user_id', ctx.session.user_id);


            const redQuery = new Parse.Query('RedPackage');
            redQuery.descending('creatAt');
            redQuery.equalTo('uid', ctx.session.user_id);


            const moneys = yield billQuery.find()
            let countBill = 0
            moneys.map(money=> {
                if (money.get('type') == 1) {
                    countBill = countBill + (money.get("money"))
                }

            })
            // console.log(countBill)
            // console.log(Math.abs(countBill))
            redQuery.descending('createdAt')
            // console.log(moneys)

            yield redQuery.find().then(function (reds) {
                let count = 0

                reds.forEach(function (n, i) {
                    count = count + n.get("total") * 100
                    let money = moneys[i]
                    console.log(moneys[i])
                    // console.log(n.get('total')+"红包---"+money.get('balance') )//+ "--" + money.get('money')+"--=="+(money.get('balance')+money.get('money')))

                })

                assert(Math.abs(countBill) == count)

            })


        });

        it('抢红包', function*() {
            //
            const ctx = app.mockContext();
            app.mockSession({
                user_id: testData.userred.id,
            });
            const redpack = yield ctx.service.test.getRedpack();


            const data = {
                id: redpack.id,
            };

            yield request(app.callback())
                .post(`/wall/redpack/rob/${testData.bpwall.id}`)
                .type('form')
                .send(data)
                .expect(res => {
                    console.log(res.body);

                    // assert(res.body.code == 1);
                    // console.log(res)
                    // res.text.should.be.exactly('Redirecting to <a href="/manager">/manager</a>.');
                })
                .expect(200)

            let rpData1 = yield app.redis.lrange('redPackages:result', 0, -1)
            for(let i=0;i<rpData1.length;i++){

                yield app.runSchedule('task');

            }

            const billQuery = new Parse.Query('UserBill');
            billQuery.descending('creatAt');
            billQuery.equalTo('user_id', ctx.session.user_id);
            const moneys = yield billQuery.find()
            let countBill = 0
            moneys.map(money=> {
                //if (money.get('type') == 1) {
                countBill = countBill + (money.get("money"))
                //}

            })

            yield  testData.userred.fetch().then(function (user) {
                assert(user.get('money') == ( countBill))
                console.log(user.get('money') +"==="+ ( countBill))
            })


        });



        it('微信支付发红包', function*() {
            console.log(testData)
            const ctx = app.mockContext();
            app.mockSession({
                user_id: testData.user.id,
            });
            const type = 'rp';
            const data = Mock.mock({
                // 属性 id 是一个自增数，起始值为 1，每次增 1
                num: Random.natural(6, 20),
                money: Random.natural(10, 100),
                content: 'id:' + Mock.mock('@csentence'),
                desk_name: Mock.mock('@csentence'),
                payWay: 0,

            });
            console.log(data);
            //yield app.redis.hincrby('money', user.objectId, -12);

            yield request(app.callback())
                .post(`/api/sendmsg/${type}/${testData.bpwall.id}`)
                .send(data)
                .expect(res => {
                    console.log(res.body);

                    // assert(res.body.code == 1);
                    // console.log(res)
                    // res.text.should.be.exactly('Redirecting to <a href="/manager">/manager</a>.');
                })
                .expect(302);

            console.log("当前余额：%s,扣除余额，%s", testData.user.get('money'), testData.user.get('money') - data.money * 100)

            let money = testData.user.get('money') - data.money * 100;
            yield testData.user.fetch().then(function (user) {
                assert(user.get('money') == money)
            })


        });

        it('红包付款模拟消息通知', function*() {

            const ctx = app.mockContext();

            const query = new Parse.Query('order');
            query.equalTo('bpwall_id', testData.bpwall.id);
            query.descending('createdAt');

            let order=yield query.first()



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





    });


});
