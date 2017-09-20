// 重力感应
var deviceMotion = {
  /**
   * 是否支持重力感应
   * @return bool
   */
  isDeviceMotion: function () {
    return window.DeviceMotionEvent;
  },

  /**
   * 摇一摇事件绑定函数
   * @param callback
   * @return void
   */
  deviceMotionHandler: function (func, errFunc) {

    if (window.DeviceMotionEvent) {

      var last_x = last_y = last_z = 0;
      var x, y, z;
      var lastTime = 0;
      var SHAKE_THRESHOLD = 1000;
      var speed = 0;
      var markTime = 0;

      //检测是否支持
      var isSupportDeviceMotion = false;
      setTimeout(function(){
        if (!isSupportDeviceMotion){
          console.log('isDeviceMotion : false');

          if (typeof errFunc == 'function') {
            errFunc();
          } else {
            alert('您的设备不支持摇一摇功能');
          }
        }
      }, 3000);

      window.addEventListener('devicemotion', function (eventData) {
        if (!isSupportDeviceMotion){
          isSupportDeviceMotion = true;
        }

        // 捕捉重力加速度
        var acceleration = eventData.accelerationIncludingGravity;
        var curTime = new Date().getTime();


        if (curTime - lastTime > 100) {
          var diffTime = curTime - lastTime;
          lastTime = curTime;
          x = acceleration.x;
          y = acceleration.y;
          z = acceleration.z;

          //cosnole.log(y);
          //console.log(z);
          //speed = Math.sqrt(( Math.pow((x-last_x), 2) + Math.pow((y-last_y), 2) + Math.pow((z-last_z), 2) ))/diffTime*2000;
          speed = Math.abs(x + y + z - last_x - last_y - last_z) / diffTime * 10000;
          if (speed > SHAKE_THRESHOLD) {
            markTime = curTime;
            func();
          }

          last_x = x;
          last_y = y;
          last_z = z;

        }
      }, false);
    } else {
      console.log('isDeviceMotion : false');

      if (typeof errFunc == 'function') {
        errFunc();
      } else {
        //alert('call func must if window.isDeviceMotion()');
      }
    }
  }

};