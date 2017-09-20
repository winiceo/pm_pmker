//横竖屏
// var updateOrientation = function(){
// 	if(window.orientation=='-90' || window.orientation=='90')
// 	alert('为了更好的体验，请将手机/平板竖过来！');
// };
// window.onorientationchange = updateOrientation;

//设置cookie
// function setCookie(cookiename, cookievalue, hours) {
// 	var date = new Date();
// 	date.setTime(date.getTime() + Number(hours) * 3600 * 1000);
// 	document.cookie = cookiename + "=" + cookievalue + "; path=/;expires = " + date.toGMTString();
// }
//
// //获取cookie
// function getCookie(cookiename){
//     var preg = new RegExp("(^| )"+cookiename+"=([^;]*)(;|$)","g");
//     if(preg.test(document.cookie)){
//         return RegExp.$2;
//     }else{
//         return "";
//     }
// }
//
// //清除cookie
// function clearCookie(cookiename) {
//     setCookie(cookiename, "", -1);
// }

//随机数
function rnd(n, m){
	return Math.floor(Math.random()*(m-n+1)+n);
}

//显示提示框
// var toast_timer = 0;
// function showToast(message){
// 	var alert = document.getElementById("toast"), toastHTML = '';
// 	if (alert == null){
// 		toastHTML = '<div id="toast">' + message + '</div>';
// 		document.body.insertAdjacentHTML('beforeEnd', toastHTML);
// 	}else{
// 		alert.style.opacity = .9;
// 	}
// 	toast_timer = setTimeout("hideToast()", 1000);
// }
//
// //隐藏提示框
// function hideToast(){
// 	var alert = document.getElementById("toast");
// 	alert.style.opacity = 0;
// 	clearTimeout(toast_timer);
// }

 var $popover = $('.popover'),
 	$lottery = $('#lotterys')
// 	$go = $('#go'),
// 	$modal = $('.popover,.modal'),
// 	$lottery_num = $('#lottery_num'),
// 	total_num = getCookie('LOTTERY_TOTAL_NUM') || 30;

var canvas = document.getElementById("lotterys"), w = h = 300;  
var ctx = canvas.getContext("2d");
var _lottery = {
	title: [],			 //奖品名称
	colors: [],			 //奖品区块对应背景颜色
	endColor: '#fd1e00', //中奖后区块对应背景颜色
	outsideRadius: 140,	 //外圆的半径
	insideRadius: 30,	 //内圆的半径
	textRadius: 105,	 //奖品位置距离圆心的距离
	startAngle: 0,		 //开始角度
	isLock: false		 //false:停止; ture:旋转
};

window.onload = function(){
	drawLottery();
}

//画出转盘
function drawLottery(lottery_index){
  	if (canvas.getContext) {
	  var arc = Math.PI / (_lottery.title.length / 2); //根据奖品个数计算圆周角度
	  ctx.clearRect(0,0,w,h); //在给定矩形内清空一个矩形
	  ctx.strokeStyle = "#e95455"; //strokeStyle 属性设置或返回用于笔触的颜色、渐变或模式  
	  ctx.font = '16px Microsoft YaHei'; //font 属性设置或返回画布上文本内容的当前字体属性
	  for(var i = 0; i < _lottery.title.length; i++) { 
		  var angle =  _lottery.startAngle + i * arc;
		  ctx.fillStyle = "#"+_lottery.colors[i];
		   
		  //创建阴影（两者同时使用） shadowBlur:阴影的模糊级数   shadowColor:阴影颜色 【注：相当耗费资源】
		  //ctx.shadowBlur = 1;  
		  //ctx.shadowColor = "#fff";  
		 
		  ctx.beginPath();
		  //arc(x,y,r,起始角,结束角,绘制方向) 方法创建弧/曲线（用于创建圆或部分圆）  
		  ctx.arc(w / 2, h / 2, _lottery.outsideRadius, angle, angle + arc, false);  
		  ctx.arc(w / 2, h / 2, _lottery.insideRadius, angle + arc, angle, true);
		  ctx.stroke();
		  ctx.fill();
		  ctx.save();    
		  
		  //----绘制奖品开始----
		  //中奖后改变背景色
		  if(lottery_index != undefined && i == lottery_index){
		  	ctx.fillStyle = _lottery.endColor;
		  	ctx.fill();
		  }
		  ctx.fillStyle = "#fff";
		  
		  var text = _lottery.title[i], line_height = 17, x, y;
		  x = w / 2 + Math.cos(angle + arc / 2) * _lottery.textRadius;
		  y = h / 2 + Math.sin(angle + arc / 2) * _lottery.textRadius;
		  ctx.translate(x, y); //translate方法重新映射画布上的 (0,0) 位置
		  ctx.rotate(angle + arc / 2 + Math.PI / 2); //rotate方法旋转当前的绘图
		  ctx.fillText(text, -ctx.measureText(text).width / 2, 0); //measureText()方法返回包含一个对象，该对象包含以像素计的指定字体宽度
		  ctx.restore(); //把当前画布返回（调整）到上一个save()状态之前 
		  //----绘制奖品结束----
	  	}     
  	}
}

//旋转转盘  angles：角度; item：奖品位置; txt：提示语;
var rotateFn = function (item, angles, txt){
	_lottery.isLock = !_lottery.isLock;
	$lottery.stopRotate();
	$lottery.rotate({
		angle: 0,
		animateTo: angles+1800,
		duration: 8000,
		callback: function (){

            setTimeout(function () {
                //self.flag_click = true;
                if (item > 0) {
                    $("#gift").show();
                } else {
                    $("#fail").show();
                }
                document.getElementById("wav").pause();
            }, 10);

			// setCookie('LOTTERY_TOTAL_NUM', total_num, 24); //记录剩余次数
			// $modal.hide();
			drawLottery(item); //中奖后改变背景颜色
			// if(item == 3 || item == 7){
			// 	$popover.show().find('.m4').show();
			// }else{
			// 	$popover.show().find('.m5').show().find('font').text(txt);
			// 	record_log(txt); //插入我的中奖纪录
			// }
			// changeNum(total_num);
			// _lottery.isLock = !_lottery.isLock;
		}
	});
};

//开始抽奖
function lottery(){
	if(_lottery.isLock) {  return; }

    $.ajax({
        type: 'POST',
        url: "/pm/lottery/draw/"+Activity.objectId,
        data: { activityid:Activity.objectId},
        success: function (data) {
            event.preventDefault();
            if (data.error == 0) {
                document.getElementById("wav").load();
                document.getElementById("wav").play();
                var result = parseInt(data.rid);
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
                var angels = [247, 202, 157, 112, 67, 22, 337, 292]; //对应角度
                drawLottery();
                item = result;
                rotateFn(item, angels[item], _lottery.title[item]);

                setTimeout(function () {
                    self.flag_click = true;
                    if (result > 0) {
                        $("#gift").show();
                    } else {
                        $("#fail").show();
                    }
                    document.getElementById("wav").pause();
                }, 8 * 1000 + 100);


                $("#startpopular").text(data.num);
            } else {
                layer.msg(data.msg);
            }
        }
    });

}



$(function(){

	var awards=Activity.awardList
    _lottery.title =["谢谢"]
    for(award in awards  ){
        _lottery.title.push(awards[award].title)
    }
    
	//动态添加大转盘的奖品与奖品区域背景颜色
	//_lottery.title = ["奖品一", "奖品二", "奖品三", "谢谢参与", "奖品四", "奖品五", "奖品六 ", "谢谢参与"];
	//_lottery.colors = ["#fe807d", "#fe7771", "#fe807d", "#fe7771","#fe807d", "#fe7771", "#fe807d", "#fe7771"];
    _lottery.colors= ['ff994e', '25c2ff', 'ff724e', 'ff73fd', 'ff724e', 'a9c82a', 'ff724e', '25c2ff'],

	//go 点击事件
	$("#go").click(function (){
		lottery();
	});

});