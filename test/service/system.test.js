'use strict';


const bpwall = new Parse.Object('bpwall');
const setting = new Parse.Object('setting');

describe('test/service/system.test.js', () => {
    let app;
    let data = {};
    let account = {};


    before(function*() {

        app = mm.app();
        yield app.ready();
        yield utils.initSystem()

    });
    before(function*() {
        yield app.ready();
        const ctx = app.mockContext();

        // data = yield {
        //     bpwall: yield ctx.service.data.bpwall(),
        //     setting: yield ctx.service.data.setting(),
        // };
        //
        // yield bpwall.save(data.bpwall);
        // yield setting.save(data.setting)


    });
    after(function*() {
        // 清空测试数据
        //yield bpwall.destroy();

        // yield setting.destroy()
    });
    afterEach(mock.restore);


    describe('/test/system.test.js', () => {

        it('初始化setting', function*() {
            const ctx = app.mockContext();
            const data = yield ctx.service.task.init_system();
            // yield ctx.service.system.init_system()
            assert(data.get('admin_bp_times') == 10);
        });

        it('缓存setting', function*() {
            const ctx = app.mockContext();

            const obj = yield ctx.service.system.getSetting();
            assert(obj.name == setting.get('name'));


        });
        it('创建账号', function*() {
            const ctx = app.mockContext();
            const mobile = Mock.mock({
                'mobile|11': /\d{1}/,
            });
            const testData = {
                username: "15810042722",
                password: '56os.com',
                bar_name: 'ABC',
                money:0,
            };
            account = yield ctx.service.system.createAccount(testData);
            assert(account.get('username') == testData.username);
            assert(account.get('money') == 0);
        });

        it('hmset 序列化', function*() {
            const ctx = app.mockContext();
            const testData = {
                a: 1,
                b: {
                    c: 'adfasdf',
                    d: true,
                },
            };
            yield ctx.app.redis.hmset('settingTest', testData);
            const tmpDt = yield ctx.app.redis.hgetall('settingTest');

            assert(tmpDt.a == 1);
            assert(tmpDt.b.d == true);


            // assert(bpwallObject.get('wall_title')==account.get('bar_name'))
        });


        it('账号创建后，初始化bpwall', function*() {
            const ctx = app.mockContext();
            const data = yield ctx.service.system.create_bpwall({account_id: account.id});
            assert(data.account.get('bpwall').get('wall_title') == account.get('bar_name'));
            // console.log(data)
            // const p=yield ctx.service.system.creatBpwallRelation(data.account.get("bpwall").id)
            // console.log(p)
            // assert(bpwallObject.get('wall_title')==account.get('bar_name'))
        });
        it('短网址', function*() {
            const ctx = app.mockContext();
            const test = yield ctx.service.system.shortUrl('3333');

            assert(test == 'http://weixin.qq.com/q/02Q0IkEE3u81T10000g07P');
        });

    });


});
