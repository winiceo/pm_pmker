
var turnplate={
    restaraunts:[],       //大转盘奖品名称
    colors:[],          //大转盘奖品区块对应背景颜色
    outsideRadius:192,      //大转盘外圆的半径
    textRadius:155,       //大转盘奖品位置距离圆心的距离
    insideRadius:68,      //大转盘内圆的半径
    startAngle:0,       //开始角度
    bRotate:false       //false:停止;ture:旋转
};
var result;
$(document).ready(function(){

    var awards=Activity.awardList
    turnplate.restaraunts =[]
    if(awards.length!=8){
        turnplate.restaraunts.push('谢谢参与')
    }
    for(award in awards  ) {
        //alert(awards[award].title)
        turnplate.restaraunts.push(awards[award].title)
    }
    //alert(JSON.stringify(turnplate.restaraunts))
    //动态添加大转盘的奖品与奖品区域背景颜色
    // turnplate.restaraunts = ["5M免费流量包","10M免费流量包","100M免费流量包","500M免费流量包","1000M免费流量包"];
    turnplate.colors = ['ff994e', '25c2ff', 'ff724e', 'ff73fd', 'ff724e', 'a9c82a', 'ff724e', '25c2ff'];


    var rotateTimeOut = function (){
        $('#wheelcanvas').rotate({
            angle:0,
            animateTo:2160,
            duration:8000,
            callback:function (){
                alert('网络超时，请检查您的网络设置！');
            }
        });
    };

    //旋转转盘 item:奖品位置; txt：提示语;
    var rotateFn = function (item, txt){
        var angles = item * (360 / turnplate.restaraunts.length) - (360 / (turnplate.restaraunts.length*2));
        if(angles<270){
            angles = 270 - angles;
        }else{
            angles = 360 - angles + 270;
        }
        $('#wheelcanvas').stopRotate();
        $('#wheelcanvas').rotate({
            angle:0,
            animateTo:angles+1800,
            duration:8000,
            callback:function (){
                // setTimeout(function () {
                self.flag_click = true;
                if (result > 0) {
                    $("#gift").show();
                } else {
                    $("#fail").show();
                }
                //document.getElementById("wav").pause();
                //}, during_time * 1000 + 100);

                turnplate.bRotate = !turnplate.bRotate;
            }
        });
    };

    $('.pointer').click(function (){
        // if(turnplate.bRotate)return;
        // turnplate.bRotate = !turnplate.bRotate;
        // //获取随机数(奖品个数范围内)
        // var item = rnd(1,turnplate.restaraunts.length);
        // //奖品数量等于10,指针落在对应奖品区域的中心角度[252, 216, 180, 144, 108, 72, 36, 360, 324, 288]
        // var item=2;
        // rotateFn(item, turnplate.restaraunts[item-1]);


        $.ajax({
            type: 'POST',
            url: "/pm/lottery/draw/"+Activity.objectId,
            data: {activityid:Activity.objectId},
            success: function (data) {
                event.preventDefault();
                if (data.error == 0) {
                    // document.getElementById("wav").load();
                    // document.getElementById("wav").play();
                    result = parseInt(data.rid);
                    if (result > 0) {
                        $(".gift_name").text(data.plevel);
                        $(".gift_award").text(data.pname);
                        var phtml1 = '<div class="prizebox1"><span class="plevel">' + data.plevel + '：</span><span class="pname">' + data.pname + '</span><span class="pstate" data-code="' + data.code + '" data-prompt="' + data.prompt + '">兑奖</span></div>';

                        var phtml2 = '<div class="prizebox2"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td><img src="' + data.headimgurl + '" width="40" class="headimgurl"></td><td><p class="nickname">' + data.nickname + '获得了' + data.plevel + '</p><p class="time">中奖时间：' + data.time + '</p></td></tr></table></div><div class="fgx"></div>'

                        // $("#prizebox1").prepend(phtml1);
                        $("#prizebox2").prepend(phtml2);
                    }
//                                    var result_angle = getrate(result);
//                                    rotate.calculate_result(result_angle, result)
                   // if(turnplate.bRotate)return;
                    turnplate.bRotate = !turnplate.bRotate;
                    //获取随机数(奖品个数范围内)
                    var item = result+1 ;
                    //奖品数量等于10,指针落在对应奖品区域的中心角度[252, 216, 180, 144, 108, 72, 36, 360, 324, 288]


                    if(data.num<=0){
                        $(".box33").show();
                    }else{
                        rotateFn(item, turnplate.restaraunts[item-1]);
                    }

                    $("#startpopular").text(data.num-1);
                } else {
                    layer.msg(data.msg);
                }
            }
        });

    });


});

function rnd(n, m){
    var random = Math.floor(Math.random()*(m-n+1)+n);
    return random;

}


//页面所有元素加载完毕后执行drawRouletteWheel()方法对转盘进行渲染
window.onload=function(){
    drawRouletteWheel();
};

function playAudio() {
    document.getElementById("audio").play();
    $("#media").addClass("rotate").removeClass("off");
}

function pauseAudio() {
    document.getElementById("audio").pause();
    $("#media").addClass("off").removeClass("rotate");
}

$("#media").click(function () {
    if ($("#media").hasClass("off")) {
        playAudio();
    } else {
        pauseAudio();
    }
});

$("#closebtn1").click(function () {
    $("#join").hide();
});

$("#closebtn2").click(function () {
    $("#fail").hide();
});

$("#closebtn3").click(function () {
    $("#gift").hide();
    window.location.href='/pm/usercenter/index'
});

$("#closebtn4").click(function () {
    $("#code").hide();
});

$(".close").click(function () {
    $("#gift").hide();
});

$('#posterCanvasOutput').qrcode({
    render: "canvas",
    width: 140,
    height: 140,
    text: window.location.href
});

$("#posterFormalClose").click(function () {
    $("#posterFormal").hide();
});

$(".sharevote").click(function () {
    $("#posterCanvas").show();
    html2canvas(document.getElementById("posterCanvas"), {
        onrendered: function (canvas) {
            canvas.id = "mycanvas";
            var dataUrl = canvas.toDataURL();
            var newImg = document.createElement("img");
            newImg.src = dataUrl;
            $("#posterFormalConetnt").html(newImg);
            $("#posterFormal").show();
            $("#posterCanvas").hide();
        }
    });
});
function drawRouletteWheel() {
    var canvas = document.getElementById("wheelcanvas");
    if (canvas.getContext) {
        //根据奖品个数计算圆周角度
        var arc = Math.PI / (turnplate.restaraunts.length/2);
        var ctx = canvas.getContext("2d");
        //在给定矩形内清空一个矩形
        ctx.clearRect(0,0,422,422);
        //strokeStyle 属性设置或返回用于笔触的颜色、渐变或模式
        ctx.strokeStyle = "#FFBE04";
        //font 属性设置或返回画布上文本内容的当前字体属性
        ctx.font = '16px Microsoft YaHei';
        for(var i = 0; i < turnplate.restaraunts.length; i++) {
            var angle = turnplate.startAngle + i * arc;
            ctx.fillStyle = "#"+turnplate.colors[i];
            ctx.beginPath();
            //arc(x,y,r,起始角,结束角,绘制方向) 方法创建弧/曲线（用于创建圆或部分圆）
            ctx.arc(211, 211, turnplate.outsideRadius, angle, angle + arc, false);
            ctx.arc(211, 211, turnplate.insideRadius, angle + arc, angle, true);
            ctx.stroke();
            ctx.fill();
            //锁画布(为了保存之前的画布状态)
            ctx.save();

            //----绘制奖品开始----
            ctx.fillStyle = "#E5302F";
            var text = turnplate.restaraunts[i];
            var line_height = 17;
            //translate方法重新映射画布上的 (0,0) 位置
            ctx.translate(211 + Math.cos(angle + arc / 2) * turnplate.textRadius, 211 + Math.sin(angle + arc / 2) * turnplate.textRadius);

            //rotate方法旋转当前的绘图
            ctx.rotate(angle + arc / 2 + Math.PI / 2);

            /** 下面代码根据奖品类型、奖品名称长度渲染不同效果，如字体、颜色、图片效果。(具体根据实际情况改变) **/
            if(text.indexOf("M")>0){//流量包
                var texts = text.split("M");
                for(var j = 0; j<texts.length; j++){
                    ctx.font = j == 0?'bold 20px Microsoft YaHei':'16px Microsoft YaHei';
                    if(j == 0){
                        ctx.fillText(texts[j]+"M", -ctx.measureText(texts[j]+"M").width / 2, j * line_height);
                    }else{
                        ctx.fillText(texts[j], -ctx.measureText(texts[j]).width / 2, j * line_height);
                    }
                }
            }else if(text.indexOf("M") == -1 && text.length>6){//奖品名称长度超过一定范围
                text = text.substring(0,6)+"||"+text.substring(6);
                var texts = text.split("||");
                for(var j = 0; j<texts.length; j++){
                    ctx.fillText(texts[j], -ctx.measureText(texts[j]).width / 2, j * line_height);
                }
            }else{
                //在画布上绘制填色的文本。文本的默认颜色是黑色
                //measureText()方法返回包含一个对象，该对象包含以像素计的指定字体宽度
                ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
            }

            //添加对应图标
            if(text.indexOf("闪币")>0){
//                    var img= document.getElementById("shan-img");
//                    img.onload=function(){
//                        ctx.drawImage(img,-15,10);
//                    };
//                    ctx.drawImage(img,-15,10);
            }else if(text.indexOf("谢谢参与")>=0){
//                    var img= document.getElementById("sorry-img");
//                    img.onload=function(){
//                        ctx.drawImage(img,-15,10);
//                    };
//                    ctx.drawImage(img,-15,10);
            }
            //把当前画布返回（调整）到上一个save()状态之前
            ctx.restore();
            //----绘制奖品结束----
        }
    }
}