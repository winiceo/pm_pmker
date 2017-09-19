var CLICK = false;
var ISLOTTERY = false;
var INFOVALUE = "";
var AWARDID = "";
var AWARDS = LOTTERYSETTING.AWARDS;
var ISCHECKED = false;
var AINDEXS = {
    7: [4],
    6: [0, 4],
    5: [0, 4, 6],
    4: [0, 2, 4, 6],
    3: [1, 3, 4, 6, 7],
    2: [1, 2, 3, 5, 6, 7],
    1: [0, 1, 2, 3, 5, 6, 7]
};
var NOINDEXS = {
    7: [4],
    6: [0, 4],
    5: [0, 2, 5],
    4: [1, 3, 5, 7],
    3: [1, 2, 3, 5, 7],
    2: [1, 2, 3, 5, 6, 7],
    1: [0, 1, 2, 3, 5, 6, 7]
};

function getOpenId() {
    var a = $.getCookie("openId");
    if (a == "") {
        $.setCookie("openId", OPENID);
        return a
    } else {
        OPENID = a;
        setMyAward();
        return a
    }
}

var lottery = {
    index: -1, count: 8, timer: 0, speed: 20, times: 0, cycle: 50, prize: 5, init: function (a) {
        if ($("#" + a).find(".lottery-unit").length > 0) {
            $lottery = $("#" + a);
            $units = $lottery.find(".lottery-unit");
            this.obj = $lottery;
            this.count = $units.length;
            $lottery.find(".lottery-unit-" + this.index).addClass("active")
        }
    }, roll: function () {
        var a = lottery.index;
        var b = lottery.count;
        $("#lotterycontent").find(".lottery-unit-" + a).removeClass("active");
        a = a + 1;
        if (a > b - 1) {
            a = 0
        }
        $("#lotterycontent").find(".lottery-unit-" + a).addClass("active");
        lottery.index = a;
        return false
    }, stop: function (a) {
        lottery.prize = a;
        return false
    }
};

function roll() {
    lottery.times += 1;
    lottery.roll();
    if (lottery.times > lottery.cycle + 10 && lottery.prize == lottery.index) {
        clearTimeout(lottery.timer);
        lottery.times = 0;
        CLICK = false;
        setTimeout("getLightBox()", 1000);
        $(".lottery-start .bg").css("background-color", "#fcd404")
    } else {
        if (lottery.times < lottery.cycle) {
            lottery.speed -= 10
        } else {
            if (lottery.times == lottery.cycle) {
            } else {
                if (lottery.times > lottery.cycle + 10 && ((lottery.prize == 0 && lottery.index == 7) || lottery.prize == lottery.index + 1)) {
                    lottery.speed += 110
                } else {
                    lottery.speed += 20
                }
            }
        }
        if (lottery.speed < 40) {
            lottery.speed = 40
        }
        lottery.timer = setTimeout(roll, lottery.speed)
    }
    return false
}

function getLightBox() {
    if (ISLOTTERY) {
        $(".lottery-p").show();
        var a = $(".lottery-unit-" + lottery.prize).attr("aindex");
        var c = IMAGEURL + AWARDS[a].PIMAGE;
        if (AWARDS[a].PIMAGE == "") {
            c = IMAGES+"/award/award.png"
        }
        var b = "恭喜您，中奖啦！";
        AWARDID = AWARDS[a].ID;
        if (LOTTERYSETTING.INFOFROM == "1") {
            $.postJSON("/web/saveinfo", {
                LOTTERYID: LOTTERYSETTING.id,
                OPENID: OPENID,
                AWARDID: AWARDID,
                VALUES: getInfoByType()
            }, function (d) {
                console.log(d);
                if (d !== null) {
                    $(".award-ul").find("span[aid=" + AWARDID + "]").text("已登记").addClass("receive").removeClass("no-receive")
                } else {
                }
            })
        }
    } else {
        var c = IMAGES+"/award/roulette-noaward-show.png";
        var b = "很遗憾 ，没有中奖"
    }
    $.lightBox({
        url: CDN+"/rs/html/showresult.html", loaded: function () {
            $(".overlay").css("opacity", "0.5");
            $(".award-image").attr("src", c);
            $(".lottery-info").text(b);
            if (ISLOTTERY) {
                $("#sure").hide();
                $(".award-btn").show()
            } else {
                $("#sure").show();
                $(".award-btn").hide()
            }
            if (ISLOTTERY && LOTTERYSETTING.INFOFROM == "1") {
                $("#sure").show();
                $(".award-btn").hide()
            }
            $(".award-btn").click(function () {
                $.closeLightBox();
                $.lightBox({
                    url: CDN+"/rs/html/info.html", loaded: function () {
                        var d = LOTTERYSETTING.INFO;
                        $(".info").each(function (g, e) {
                            var f = $(e).attr("name");
                            if ($.inArray(f, d) > -1) {
                                $(e).show()
                            }
                        });
                        $(".overlay").css("opacity", "0.9")
                    }
                })
            })
        }
    })
}

function getAward(a) {
    var b = {};
    $(AWARDS).each(function (d, c) {
        if (AWARDS[d].ID === a) {
            b = AWARDS[d]
        }
    });
    return b
}

function setWardIndex() {
    var b = NOINDEXS[AWARDS.length];
    var a = AINDEXS[8 - AWARDS.length];
    $(b).each(function (d, c) {
        $(".lottery-prize-" + c + " img").attr("src", IMAGES+"/award/roulette-bg-noaward.png")
    });
    $(a).each(function (e, c) {
        var d = IMAGEURL + AWARDS[e].PIMAGE;
        if (AWARDS[e].PIMAGE == "") {
            d = IMAGES+"/award/award.png"
        }
        $(".lottery-prize-" + c + " img").attr("src", d);
        $(".lottery-unit-" + c + " span").text(AWARDS[e].PNAME);
        $(".lottery-unit-" + c).attr("awardid", AWARDS[e].ID);
        $(".lottery-unit-" + c).attr("prize", c);
        $(".lottery-unit-" + c).attr("aindex", e)
    })
}

function getNoawardIndex() {
    var b = NOINDEXS[AWARDS.length];
    var a = Math.floor(Math.random() * (8 - AWARDS.length));
    console.log(AWARDS.length);
    console.log(a);
    console.log(b);
    return b[a]
}

function setMyAward() {
    $.postJSON("/lottery/user/awardresult", {LOTTERYID: LOTTERYSETTING.id, OPENID: OPENID}, function (a) {
        if (a.length > 0) {
            $(".no-award-li").hide();
            $(a).each(function (c, b) {
                console.log(b.AID);
                var d = getAward(b.AID);
                var e = false;
                if (b.AINFO !== undefined) {
                    e = true
                }
                $(".award-ul").append(getAwardLi(d, e))
            });
            $(".lottery-p").show()
        }
    })
}

function getAwardLi(d, f) {
    var a = '<li class="award-li" ><div class="pname-div"><span>奖品名：</span><span class="pname-span">{0}</span></div><span aid={1} class="state {2}">{3}</span></li>';
    var c = "receive";
    var e = "已登记";
    if (!f) {
        var c = "no-receive";
        var e = "登记领奖品"
    }
    var b = $.format(a, d.PNAME, d.ID, c, e);
    return b
}

function bindEvent() {
    $(".lottery-unit.lottery-start").click(function () {
        if (CLICK) {
            return false
        } else {
            $(".lottery-start .bg").css("background-color", "#e2be01");
            var a = getQueryString("ex");
            $.postJSON("/lottery/getresult", {LOTTERYID: LOTTERYSETTING.id, OPENID: OPENID, EX: a}, function (b) {
                console.log(b);
                var b=b.result;
                var d = 0;
                if (b === "NOAWARD") {
                    ISLOTTERY = false;
                    console.log("没有中奖");
                    d = getNoawardIndex()
                } else {
                    if (b === "TimeOut") {
                        console.log("活动已经结束");
                        $.alert("活动已经结束");
                        return
                    } else {
                        if (b === "NumberOutAll") {
                            console.log("抽奖次数已经用完");
                            $.alert("抽奖次数已经用完");
                            return
                        } else {
                            if (b === "NumberOutDay") {
                                console.log("今天的抽奖机会已经用完");
                                $.alert("今天的抽奖机会已经用完");
                                return
                            } else {
                                if (b === "Frequency") {
                                    $.alert("抽奖频率太快,请稍后再试");
                                    return
                                } else {
                                    if (b === "Duplciated") {
                                        $.alert("这个奖项已经打开过了");
                                        return
                                    } else {
                                        if (b === "Error") {
                                            $.alert("系统繁忙");
                                            return
                                        } else {
                                            d = $(".lottery-unit[awardid=" + b + "]").attr("prize");
                                            ISLOTTERY = true;
                                            $(".no-award-li").hide();
                                            var c = getAward(b);
                                            $(".award-ul").append(getAwardLi(c, false));
                                            console.log(d)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                lottery.prize = d;
                lottery.speed = 80;
                roll();
                CLICK = true;
                return false
            })
        }
    });
    $("#lotterydesc").click(function () {
        var a = LOTTERYSETTING.INS;
        $.lightBox({
            url: CDN+"/rs/html/instruction.html", loaded: function () {
                $(".overlay").css("opacity", "0.9");
                $(".content-span").text(a)
            }
        })
    });
    $("#lotteryprize").click(function () {
        $.lightBox({
            url: "#myaward", loaded: function () {
                $(".overlay").css("opacity", "0.9")
            }
        })
    });
    $("#lbContent").on("click", "#sure,#cancel", function () {
        $.closeLightBox()
    });
    $("#lbContent").on("click", "#warning-checkbox", function () {
        if ($(this).is(":checked")) {
            $("#save").removeClass("disabled");
            ISCHECKED = true
        } else {
            $("#save").addClass("disabled");
            ISCHECKED = false
        }
    });
    $("#lbContent").on("click", ".no-receive", function () {
        $.closeLightBox();
        AWARDID = $(this).attr("aid");
        $.lightBox({
            url: "/rs/html/info.html", loaded: function () {
                var a = LOTTERYSETTING.INFO;
                $(".info").each(function (d, b) {
                    var c = $(b).attr("name");
                    if ($.inArray(c, a) > -1) {
                        $(b).show()
                    }
                });
                $(".overlay").css("opacity", "0.9")
            }
        })
    });
    $("#lbContent").on("click", "#save", function () {
        if (!ISCHECKED) {
            return false
        }
        var a = $(".content-div").getValues();
        $("input").removeClass("error");
        if (LOTTERYSETTING.INFOFROM != "1") {
            if (a.NAME == undefined || a.NAME === "") {
                $("input[name='NAME']").addClass("error");
                return false
            }
        }
        $.postJSON("/lottery/saveinfo", {
            LOTTERYID: LOTTERYSETTING.id,
            OPENID: OPENID,
            AWARDID: AWARDID,
            VALUES: a
        }, function (b) {
            console.log(b);
            if (b !== null) {
                $.closeLightBox();
                $.alert("提交成功!");
                $(".award-ul").find("span[aid=" + AWARDID + "]").text("已登记").addClass("receive").removeClass("no-receive")
            } else {
                $.closeLightBox();
                $.alert("提交失败！")
            }
        })
    })
}

function getQueryString(a) {
    var b = new RegExp("(^|&)" + a + "=([^&]*)(&|$)", "i");
    var c = window.location.search.substr(1).match(b);
    if (c != null) {
        return decodeURI(c[2])
    }
    return ""
}

function init() {
    $("#lotteryname").text(LOTTERYSETTING.NAME || "");
    setWardIndex();
    bindEvent()
}

function getQueryString(a) {
    var b = new RegExp("(^|&)" + a + "=([^&]*)(&|$)");
    var c = window.location.search.substr(1).match(b);
    if (c != null) {
        return decodeURI(c[2])
    }
    return null
}

function getInfoByType() {
    var a = {};
    switch (LOTTERYSETTING.INFOTYPE) {
        case"text":
        case"name":
            a.NAME = INFOVALUE;
            break;
        case"email":
            a.EMAIL = INFOVALUE;
            break;
        case"phone":
            a.MOBILE = INFOVALUE
    }
    return a
}

head.ready(function () {
    getOpenId();
    console.log(OPENID);
    init();
    if (LEVEL == "level_3") {
        $("#bangboss-bottom").hide()
    }
    $(".lottery-tousu").click(function () {
        window.location.href = "http://www.jsform.com/web/formview/58ad8350bb7c7c5d23124f4f?field3=http://lottery.bangboss.com/web/phone/" + LOTTERYSETTING.id + "&field5=" + LOTTERYSETTING.UID + "&field7" + LOTTERYSETTING.INS;
        return false
    });
    if (LOTTERYSETTING.INFOFROM == "1") {
        if (ENTRY && ENTRY.status == "success") {
            var a = LOTTERYSETTING.INFONM;
            a = a.replace("F", "field");
            INFOVALUE = ENTRY[a] || ""
        } else {
            LOTTERYSETTING.INFOFROM = "0"
        }
    }
    var b = getQueryString("ex");
   // history.replaceState(null, null, "/web/phone/" + LOTTERYSETTING.id + "?ex=" + b)
});