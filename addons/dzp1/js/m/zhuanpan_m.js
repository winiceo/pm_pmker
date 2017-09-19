/**
 * 大转盘
 * gaoz
 */

;(function (g) {
    if (g.zp) return;

    var zp = g.zp = {
        _zhuanpanInfo: null,
        _zhuanpanId: null,
        _Gd: null,
        _prizeInfo: [],

        _lightTime0: null,
        _lightTime1: null,
        _lightTime2: null,
        _qrMarqueTimer: null,

        _oldClass: null,
        _rotateId: null,


        _zpStatus: 'waiting',  //waiting 等待本轮未参与, prizing 本轮正在抽奖  , ending 本轮已经参与过了
        _shakeCount: 0, // 摇动次数
        _subShake: false, // 是否监听摇动

        // 转盘的背景色
        _bgMap: ['ff994e', '25c2ff', 'ff724e', 'ff73fd', 'ff724e', 'a9c82a', 'ff724e', '25c2ff'],


    }

    /**
     * 初始化
     */
    zp.init = function () {
        zp.initPage();

        if (hasJoin) {
            $(".js_joined").show();
            return;
        }

        zp.initWebsocket();
        zp.initCanvas();
    }


    /**
     * 初始化ws
     */
    zp.initWebsocket = function () {
        // var lottery = io('ws://localhost:7001')
        // chat.on('chat', function(data) {
        //     console.log('======chat data: ', data)
        //     chat.emit('comment', 'Hi server chat')
        // })
        // socket.on('connect', () => {
        //     console.log('connect!');
        //     socket.emit('lottery', 'hello world!');
        //
        // });
        //
        // socket.on('fuck', msg => {
        //     console.log('res from server: %s!', msg);
        // });
        zp._ws = io(websocketUrl);
        zp._ws.on('connect', zp.wsOnOpen)
        zp._ws.on('message', zp.wsOnMessage)
        zp._ws.on('disconnect', zp.wsOnClose)

        // zp._ws = new WebSocket(websocketUrl);
        // zp._ws.onopen = zp.wsOnOpen;
        // zp._ws.onmessage = zp.wsOnMessage;
        // zp._ws.onclose = zp.wsOnClose;
    }

    /**
     * 初始化canvas
     * @returns {null}
     */
    zp.initCanvas = function () {
        if (zp._Gd != null) return zp._Gd;
        var LCanvas = document.getElementById('lottery');
        zp._Gd = LCanvas.getContext('2d');
    }

    /**
     * 初始化两个跑马灯
     */
    zp.initDots = function () {
        var oDots = document.getElementById('dots');

        for (var i = 0; i < oDots.children.length; i++) {
            oDots.children[i].style.WebkitTransform = 'perspective(800px) rotate(' + i * 15 + 'deg)';
        }
    }

    zp.initPage = function () {
        zp.initDots();
        zp.light(0);
        //根据手机屏幕高度缩放
        var sca = ($(document).height() - 251) / 824;
        $('.con-l').css({
            '-webkit-transform': 'translate(0,' + $('.con-l').height() / 2 * (1 - sca) + 'px) scale(' + sca + ',' + sca + ') '
        });
        $('.item3 .mess').css({
            '-webkit-transform': 'translate(0,' + (-$('.item3 .mess').height() / 2 * (1 - sca)) + 'px) scale(' + sca + ',' + sca + ') '
        });

        //操作提示弹层2s后消失
        setTimeout(function () {
            $('.item3').animate({'opacity': '0'}, 1000, function () {
                $('.item3').css('display', 'none')
            });
        }, 1000);

    }

    /**
     * 各种事件
     */
    zp.bindEvent = function () {

        // 点击开始抽奖
        zp.clickStartLottery();

        // 摇动开始抽奖
        zp.shakeStartLottery();
        // 滚动转盘开始抽奖
        zp.touchStartLottery();

        // 分享
        $(".js_btnShare").on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            $("#guide").show();

        })
        // 关闭分享
        $("#guide").on('click', function (e) {
            $("#guide").hide();
        })


    }

    /**
     * 初始化奖品
     */
    zp.initPrize = function () {
        // 初始化奖品数据
        zp._prizeInfo = [];
        var prizeL = zp._zhuanpanInfo.prize_info.length, i = 0, prizeInfo = zp._zhuanpanInfo.prize_info;

        console.log(zp._zhuanpanInfo)
        for (i; i < prizeL; i++) {
            var curObj = {'tex': prizeInfo[i]['prize_name'], 'img': prizeInfo[i]['photo'], 'bg': '#' + zp._bgMap[i]};
            zp._prizeInfo.push(curObj);
        }

        //console.log('初始化好的奖品');
        //console.log(zp._prizeInfo);

        switch (prizeL) {
            case 2:
                zp.drawWheelCanvas({
                    cx: '0',
                    cy: '5',
                    rx: '0',
                    ry: '125',
                    fx: '0',
                    fy: '194'
                });
                break;
            case 3:
                zp.drawWheelCanvas({
                    angle: '-90',
                    cx: '2.5',
                    cy: '5',
                    rx: '64',
                    ry: '108',
                    fx: '96',
                    fy: '168'
                });
                break;
            case 4:
                zp.drawWheelCanvas({
                    cx: '5',
                    cy: '5',
                    rx: '89',
                    ry: '89',
                    fx: '137',
                    fy: '137'
                });
                break;
            case 5:
                zp.drawWheelCanvas({
                    cx: '5',
                    cy: '5',
                    rx: '100',
                    ry: '75',
                    fx: '154',
                    fy: '116'
                });
                break;
            case 6:
                zp.drawWheelCanvas({
                    cx: '9',
                    cy: '5',
                    rx: '110',
                    ry: '60',
                    fx: '170',
                    fy: '100'
                });
                break;
            case 7:
                zp.drawWheelCanvas({
                    cx: '9',
                    cy: '5',
                    rx: '110',
                    ry: '55',
                    fx: '180',
                    fy: '90'
                });
                break;
            case 8:
                zp.drawWheelCanvas({
                    cx: '9',
                    cy: '5',
                    rx: '120',
                    ry: '50',
                    fx: '190',
                    fy: '85'
                });
                break;
            default:
                alert('只能设置2-8个奖项');
                break;
        }

    }

    // 打开ws
    zp.wsOnOpen = function () {
        zp.wsLogin();
    }

    // 消息到来时
    zp.wsOnMessage = function (e) {
        console.log(e);
        var data = JSON.parse(e);
        //console.log('msg');
        console.log(data);

        if (data.url && 'ok' != data.msg) {
            alert(data.msg);
            return;
        }
        // login
        if ('zhuanpan/login' == data.url) {
            zp.wsGetZhuanPan();
            // get zhuanpan
        } else if ('zhuanpan/get_zhuanpan' == data.url) {

            if (data.body && data.body.id) {
                zp._zhuanpanInfo = data.body;

                zp._zhuanpanId = data.body.id;

                zp.wsBindUid();

            } else {
                // reget
                setTimeout(function () {
                    zp.wsGetZhuanPan();
                }, 5000);
            }
            // 中奖用户
        } else if ('zhuanpan/prize_user' == data.url) {
            //
            console.log(data.body)
            zp.renderPrizeUser(data.body);
        } else if ('zhuanpan/bind_uid' == data.url) {
            zp.initPrize();
            zp.bindEvent();

            zp._rotateId = zp.getRandom(zp._zhuanpanInfo.prize_info.length, 0);

        } else if ('zhuanpan/change_join_status' == data.url) {
            zp.prizeFail(data.body);
        } else if ('zhuanpan/prize_update' == data.url) {
            // 更新奖品
            zp._zhuanpanInfo.prize_info = data.body;
            zp._rotateId = zp.getRandom(zp._zhuanpanInfo.prize_info.length, 0);
            zp.initPrize();
        }
    }

    // ws关闭时
    zp.wsOnClose = function () {
        setTimeout(function () {
            zp.wsInit();
        }, 1000);
    }

    // 关闭ws
    zp.wsClose = function () {
        zp.initWebsocket();
    }

    // ws登录
    zp.wsLogin = function () {
        zp.wsSend("zhuanpan/login", {
            "session": sessionId
        });
    }

    // ws绑定屏幕与红包
    zp.wsBindUid = function () {

        zp.wsSend("zhuanpan/bind_uid", {
            "zhuanpan_id": zp._zhuanpanId,
            "company_id": companyId,
        });
    }

    // ws发送消息
    zp.wsSend = function (url, params) {
        var dataJson = {
            'url': url,
            'params': params,
            'token': token
        };
        var dataStr = JSON.stringify(dataJson);

        //console.log('send params', dataStr);
        zp._ws.emit('lottery', dataJson);
    }

    // 获取转盘
    zp.wsGetZhuanPan = function () {
        zp.wsSend("zhuanpan/get_zhuanpan", {
            "company_id": companyId,
        })
    }

    // 通知大屏开始抽奖
    zp.wsStartLottery = function (rotateId) {
        zp.wsSend('zhuanpan/start_lottery', {
            "zhuanpan_id": zp._zhuanpanId,
            "rotate_id": rotateId,

        })
    }

    // 同步中奖数据
    zp.wsPrizeSync = function (prizeId) {
        var prizeId = prizeId || 0;
        zp.wsSend('zhuanpan/prize_sync', {
            "zhuanpan_id": zp._zhuanpanId,
            "prize_id": prizeId
        });
    }

    /**
     * 没有奖品的时候去更新下状态
     */
    zp.wsChangeStatus = function () {
        zp.wsSend("zhuanpan/change_join_status", {
            "zhuanpan_id": zp._zhuanpanId
        })
    }

    //canvas///////////////////////////////////////////
    /**
     * 画圆圈
     * 圆心x, 圆心y, radius, start_degree, end_degree, color
     */
    zp.drawArc = function (cx, cy, r, sd, ed, color) {
        var gd = zp._Gd;
        gd.beginPath();
        gd.moveTo(cx, cy);
        gd.arc(cx, cy, r, zp.degreeToangle(sd), zp.degreeToangle(ed), false);
        gd.closePath();
        gd.fillStyle = color;
        gd.fill();
    }


    /**
     * 度数转弧度
     * 2π == 360  n
     * @param degree
     */
    zp.degreeToangle = function (degree) {
        //2 * Math.PI / 360 * degree;
        return Math.PI / 180 * degree;
    }

    /**
     * 绘制大转盘
     * @param json
     */
    zp.drawWheelCanvas = function (json) {
        zp._Gd.clearRect(0, 0, 475, 475);
        var count = 0, sum = 0, gd = zp._Gd, n = zp._prizeInfo.length;
        for (var i = 0; i < zp._prizeInfo.length; i++) {
            if (zp._prizeInfo[i].img) {
                sum++;
            }
        }
        for (var j = 0; j < zp._prizeInfo.length; j++) {
            var oImg = new Image();
            oImg.src = zp._prizeInfo[j].img;
            oImg.onload = function () {
                count++;
                if (count == sum) {
                    for (var i = 0; i < n; i++) {
                        gd.save();
                        gd.translate(225, 225);

                        gd.rotate(zp.degreeToangle(360 / n - 90 + i * (360 / n)));//gai

                        //画饼
                        zp.drawArc(json.cx, json.cy, 210, 0, 360 / n, zp._prizeInfo[i].bg);//gai
                        //奖品
                        if (zp._prizeInfo[i].img) {
                            zp.drawArc(json.rx, json.ry, 40, 0, 360, 'rgba(255,255,255,.3)');
                            //gd.drawImage(oImg,parseInt(json.rx)-25,parseInt(json.ry)-25,50,50);
                        }

                        if (zp._prizeInfo[i].img) {
                            zp.drawArc(json.rx, json.ry, 30, 0, 360);

                            zp.drawArc(json.rx, json.ry, 30, 0, 360);
                            gd.save();
                            gd.translate(json.rx - 30, json.ry - 30);
                            gd.rotate(zp.degreeToangle(360));

                            var oImg2 = new Image();
                            oImg2.src = zp._prizeInfo[i].img;
                            var pattern = gd.createPattern(oImg2, 'no-repeat');
                            gd.arc(json.rx, json.ry, 30, 0, 2 * Math.PI);
                            gd.fillStyle = pattern;

                            gd.fill();
                            gd.restore();
                        }
                        //写字
                        (function (i) {
                            gd.save();
                            // 重新定位画布
                            gd.translate(json.fx, json.fy);//gai
                            // 旋转
                            gd.rotate(zp.degreeToangle(90 + 180 / n));//gai
                            // gd.strokeRect(0,0,475,475);
                            gd.font = '20px Microsoft YaHei';
                            gd.fillStyle = '#fff';
                            gd.textAlign = 'center';
                            // 写字 x,y, width
                            gd.fillText(zp._prizeInfo[i].tex, 0, 20);
                            // 保存路径
                            gd.restore();
                        })(i);

                        gd.restore();
                    }
                }

            }
        }
    }


    /**
     * 跑马灯效果
     * @param rotate
     */
    zp.light = function (rotate) {
        switch (rotate) {
            case 0:
                clearInterval(zp._lightTime0);
                clearInterval(zp._lightTime1);
                //跑马灯效果2----单数/偶数交替
                zp._lightTime2 = setInterval(function () {
                    $('.dots span:odd').addClass('up');
                    $('.dots span:even').removeClass('up');
                    setTimeout(function () {
                        $('.dots span:even').addClass('up');
                        $('.dots span:odd').removeClass('up');
                    }, 450)
                }, 900);
                break;
            case 1:
                clearInterval(zp._lightTime2);
                clearInterval(zp._lightTime3);
                //跑马灯效果1---一个灯亮
                $('#dots span').removeClass('up');
                var i = 0;
                zp._lightTime0 = setInterval(function () {
                    if (i == 24) {
                        i = 0;
                    } else {
                        for (var j = 0; j < 6; j++) {
                            $('#dots span:eq(' + (i + j) % 24 + ')').addClass('up');
                        }
                        $('#dots span:eq(' + i + ')').removeClass('up');

                        i++;

                    }

                }, 100);

                break;
            case 2:
                clearInterval(zp._lightTime0);
                clearInterval(zp._lightTime2);
                //跑马灯效果3----全部
                zp._lightTime3 = setInterval(function () {
                    $('#dots span').addClass('up');
                    setTimeout(function () {
                        $('#dots span').removeClass('up');
                    }, 300)
                }, 600);

                break;
        }
    }

    /**
     * 旋转效果
     * 添加类
     * @param n
     */
    zp.rotate = function (n) {
        var className = '';
        if (zp._oldClass) {
            $('#lottery').removeClass(zp._oldClass);
        }
        switch (n) {
            case 2:
                ClassName = 'twoRoll-';
                break;
            case 3:
                ClassName = 'threeRoll-';
                break;
            case 4:
                ClassName = 'fourRoll-';
                break;
            case 5:
                ClassName = 'fivRoll-';
                break;
            case 6:
                ClassName = 'sixRoll-';
                break;
            case 7:
                ClassName = 'sevenRoll-';
                break;
            case 8:
                ClassName = 'eightRoll-';
                break;
            default:
                alert('只能设置2-6个奖项');
                break;
        }


        var currClass = ClassName + parseInt(zp._rotateId + 1);
        $('#lottery').addClass(currClass).on(ani, function () {
            // 游戏结束
            zp.light(2);
            zp._zpStatus = 'ending';
            var currPrize = zp._zhuanpanInfo.prize_info[zp._rotateId];
            if (currPrize['left_num'] <= 0) {
                zp._zpStatus = 'ending';

                // 只去更新奖品数量
                // 没有奖品了, 抽奖失败
                // todo
                zp.wsChangeStatus();
                //alert('奖品已经没有喽');
                return;
            } else {
                zp.wsPrizeSync(currPrize['id']);
            }
        });
        zp._oldClass = currClass;
    }

    /**
     * 获取随机数
     * @param max
     * @param min
     */
    zp.getRandom = function (max, min) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    /**
     * 二维码的跑马灯
     * 定时器的效果很差
     */
    zp.qrMarquee = function () {
        //console.log('qrmarquee');
        $('#dots2 span:even').addClass('up');
        zp.stopQrMarquee();
        zp._qrMarqueTimer = setInterval(function () {
            $('#dots2 span:odd').addClass('up');
            $('#dots2 span:even').removeClass('up');
            setTimeout(function () {
                $('#dots2 span:even').addClass('up');
                $('#dots2 span:odd').removeClass('up');
            }, 300)
        }, 600);
    }

    /**
     * 二维码的跑马灯效果关掉
     */
    zp.stopQrMarquee = function () {
        if (zp._qrMarqueTimer != null) {
            clearInterval(zp._qrMarqueTimer);
            zp._qrMarqueTimer = null;
        }
    }

    /**
     * 点击按钮开始抽奖
     */
    zp.clickStartLottery = function () {
        //if ('waiting' != zp._zpStatus) return ;
        //zp.startLottery();
        $('.js_btnStart').bind({
            'click': function (ev) {
                ev.preventDefault();
                $(this).animate({'height': '45'}, 30);
                zp.startLottery();
            }, 'touchend': function () {
                $(this).animate({'height': '50'}, 30);
            }
        });
    }

    /**
     * 触摸开始抽奖
     */
    zp.touchStartLottery = function () {
        if ('waiting' != zp._zpStatus) return;
        // 转动开始
        var startX = 0, startY = 0, endX = 0, endY = 0, offX = 0, offY = 0;
        $("#lottery").on('touchstart', function (ev) {
            var oTouch = ev.originalEvent.touches[0];
            startX = oTouch.pageX;
            startY = oTouch.pageY;
            ev.preventDefault();
        });

        $("#lottery").on('touchmove', function (ev) {
            var touchObj = ev.originalEvent.touches[0];
            endX = touchObj.pageX;
            endY = touchObj.pageY;
            offX = endX - startX;
            offY = endY - startY;
            if (offX > 5 && offY > 5) {
                zp.startLottery();
            }
        });

        $("#lottery").on('touchend', function (ev) {
            var touchObj = ev.originalEvent.touches[0];
        })
    }

    /**
     * 摇动开始抽奖
     */
    zp.shakeStartLottery = function () {
        deviceMotion.deviceMotionHandler(zp.shakeHandler);
    }

    /**
     * 摇动处理
     */
    zp.shakeHandler = function () {
        if ('waiting' != zp._zpStatus) return;
        if (zp._shakeCount > 5) {
            zp.startLottery();
        }
        zp._shakeCount++;
    }

    /**
     * 开始抽奖
     */
    zp.startLottery = function () {
        if ('waiting' != zp._zpStatus) return;
        zp._zpStatus = 'prizing';

        //console.log('startlottery', zp._rotateId);

        // 通知开始抽奖
        // todo 实时性有待测试
        zp.wsStartLottery(zp._rotateId);

        var n = zp._prizeInfo.length;
        zp.rotate(n);
        zp.light(1);
        /*
        setTimeout(function(){
            zp.light(2);
            setTimeout(function(){
                zp.light(0);
            });
        }, 10000);
        */
    }


    /**
     * 渲染奖品
     */
    zp.renderPrizeUser = function (data) {
        if (data.user_id) {
            $(".js_userAvatar").attr('src', data.avatar);
            $(".js_userName").html(data.user_name);
            $(".js_prizeCover").attr('src', data.photo);
            $(".js_prizeTitle").html(data.prize_title);

            $(".js_prizeUser").show();
        }
    }

    /**
     * 抽奖失败了
     */
    zp.prizeFail = function (data) {
        if (data.user_id) {
            $(".js_failUserAvatar").attr('src', data.avatar);
            $(".js_failUserName").html(data.user_name);

            $(".js_prizeFail").show();
        }
    }


})(window);
zp.init();
