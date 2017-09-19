'use strict';
module.exports = () => {
    return function* () {
        const message = this.args[0];
        console.log('chat :', message + ' : ' + process.pid);
        let data = {}
        data.url = message.url
        data.msg = "ok"
        switch (message.url) {
            case "zhuanpan/login":

                break;

            case 'zhuanpan/get_zhuanpan':
                data.body = {
                    add_time: "2017-09-12 12:26:18",
                    close_time: "0000-00-00 00:00:00",
                    company_id: "188411",
                    id: "492",
                    is_open: "1",
                    join_method: "1",
                    open_time: "2017-09-12 12:26:18",
                    prize: "",
                    prize_info: [{
                        id: "566",
                        photo: "http://hddpm.quxianchang.com/static/upload/slave2_store2/2017/09/12/20170912122618000000_3_162483_5178.jpg",
                        prize_level: "444",
                        prize_name: "55555",
                        status: "1",
                    }, {
                        id: "565",
                        photo: "http://hddpm.quxianchang.com/static/upload/slave2_store2/2017/09/12/20170912122618000000_2_103119_196.jpg",
                        prize_level: "1",
                        prize_name: "11",
                        status: "1",
                    },{
                        id: "564",
                        photo: "http://hddpm.quxianchang.com/static/upload/slave2_store2/2017/09/12/20170912122618000000_2_103119_196.jpg",
                        prize_level: "1",
                        prize_name: "11",
                        status: "1",
                    }],
                    rule: "1",
                    status: "1",
                    title: "大转盘标题   234234",
                    update_time: "2017-09-12 12:26:18",
                    user_id: "5344356"
                }
                break;
            case 'bind_screen':
                break;

            //中奖
            case 'zhuanpan/prize_sync':
                data.url='zhuanpan/prize_user',
                    data.body={
                        user_id:'234',
                        avatar:'',
                        photo:"",
                        prize_title:'324234'
                    }
                break;  //中奖

            case 'zhuanpan/prize_user':
                data.body={
                    avatar:'',
                    photo:"",
                    prize_title:'324234'
                }


                break;

           case 'zhuanpan/change_join_status':
                break;


            case 'zhuanpan/bind_uid':
                break;
            default:
                data = {abc: 3333}
        }
        //const say = yield this.service.user.say();
        this.socket.emit('message', JSON.stringify(data));
    }
        ;
};
