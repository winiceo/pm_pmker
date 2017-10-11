'use strict';


const bpwall = new Parse.Object('bpwall');
const setting = new Parse.Object('setting');

describe('test/service/ossgreen.test.js', () => {
    let app;
    let data = {};
    let account = {};


    before(function*() {

        app = mm.app();
        yield app.ready();
        //yield utils.initSystem()

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


    describe('/test/service/ossgreen.test.js', () => {

        it('初始化setting', function*() {
            const ctx = app.mockContext();



//             /**
//              * Created by hyliu on 16/12/16.
//              */
//             var ALY = require("aliyun-sdk")
//             this.env = app.config.env;
//             var green = new ALY.GREEN({
//
//                 accessKeyId: this.env.get('ALI_OSS_ID'),
//                 secretAccessKey: this.env.get('ALI_OSS_SECRET'),
//                 endpoint: 'http://green.cn-hangzhou.aliyuncs.com',
//                 apiVersion: '2016-12-16'
//             });
//             console.log(green)
// // 构建一个 Aliyun Client, 用于发起请求
// // 构建Aliyun Client时需要设置AccessKeyId和AccessKeySevcret
//
//             /**
//              *
//              * 同步调用只支持单张图片
//              */
//             var urls = ['https://leven-dev.oss-cn-shanghai.aliyuncs.com/bpmsg/dICv2BMrO2/1488957362654.jpg'];
//
//             /**
//              * 同步图片检测支持多个场景, 但不建议一次设置太多场景:
//              * porn:  黄图检测
//              * ocr:  ocr文字识别
//              * illegal: 暴恐敏感检测
//              * qrcode: 二维码识别
//              * ad: 牛皮藓广告识别结果
//              * sensitiveFace: 敏感人脸识别
//              */
//             var scenes =  ["porn"];
//             const taskIds=[]
//             var promis=new Parse.Promise()
//             var promis1=new Parse.Promise()
//             green.imageDetection({
//                     Async: true,
//                     ImageUrl: JSON.stringify(urls),
//                     Scene: JSON.stringify(scenes)
//                 },
//                 function(err, data){
//                     if(err) {
//                         console.log('error:', err);
//                         return;
//                     }
//
//                     console.log('success:', JSON.stringify(data));
//
//                     //获取taskId, 然后在调用取图片检测结果接口获取最终检测结果,参考AsyncImageDetectionResultSample.js
//
//                     var imageResults = data.ImageResults.ImageResult;
//
//
//                     for( var i = 0;i<imageResults.length;i++){
//                         taskIds.push(imageResults[i].TaskId);
//                     }
//                     promis.resolve()
//                     console.log('taskIds:', JSON.stringify(taskIds));
//                 }
//             );
//             yield promis
//             //var taskIds = ['55b1a3fe-7671-43a8-84b9-c7aa3438bff9-1486545144026'];
//
//
//              green.imageResults({
//                 TaskId: JSON.stringify(taskIds)
//             }, function(err, data){
//                 if(err) {
//                     console.log('error:', err);
//                     return;
//                 }
//                 console.log('success:', JSON.stringify(data));
//
//                 //判断是否成功
//                 if(data.Code === 'Success') {
//
//                     var imageDetectResults = data.ImageDetectResults.ImageDetectResult;
//
//                     for( var i = 0;i<imageDetectResults.length;i++){
//                         var imageResult = imageDetectResults[i].ImageResult;
//                         var status = imageDetectResults[i].Status;
//
//                         if("TaskProcessSuccess" == status) {
//                             var imageUrl = imageResult.ImageName;
//                             var taskId = imageResult.TaskId;
//                             //获取结果
//                             var pornResult = imageResult.PornResult;
//                             var ocrResult = imageResult.OcrResult;
//                             var illegalResult = imageResult.IllegalResult;
//                             var sensitiveFaceResult = imageResult.SensitiveFaceResult;
//                             var adResult = imageResult.AdResult;
//                             var qrcodeResult = imageResult.QrcodeResult;
//
//                             /**
//                              * 黄图检测结果
//                              */
//                             if(!isEmpty(pornResult)){
//                                 /**
//                                  * 黄图分值, 0-100
//                                  */
//                                 console.log(pornResult.Rate);
//                                 /**
//                                  * 绿网给出的建议值, 0表示正常，1表示色情，2表示需要review
//                                  */
//                                 console.log(pornResult.Label);
//                             }
//
//                             /**
//                              * ocr识别结果
//                              */
//                             if(!isEmpty(ocrResult)){
//                                 console.log(ocrResult.Text);
//                             }
//
//                             /**
//                              * 暴恐敏感识别结果
//                              */
//                             if(!isEmpty(illegalResult)){
//                                 /**
//                                  * 分值, 0-100
//                                  */
//                                 console.log(illegalResult.Rate);
//                                 /**
//                                  * 绿网给出的建议值, 0表示正常，1表示命中暴恐渉政，2表示需要review
//                                  */
//                                 console.log(illegalResult.Label);
//                             }
//
//                             /**
//                              * 牛皮藓广告识别结果
//                              */
//                             if(!isEmpty(adResult)){
//                                 /**
//                                  * 分值, 0-100
//                                  */
//                                 console.log(adResult.Rate);
//                                 /**
//                                  * 绿网给出的建议值, 0表示正常，1表示广告，2表示需要review
//                                  */
//                                 console.log(adResult.Label);
//                                 /**
//                                  * 风险: 0:正常, 1:图片带文字, 2:二维码, 3: 图片有文字且有二维码
//                                  */
//                                 console.log(adResult.RiskType);
//
//                                 //如果是二维码, 可获取到二维码内容
//                                 console.log(adResult.RiskDetails);
//                             }
//
//                             /**
//                              * 二维码识别结果
//                              */
//                             if(!isEmpty(qrcodeResult)){
//                                 console.log(qrcodeResult.QrcodeList);
//                             }
//
//                             /**
//                              * 人脸识别结果
//                              */
//                             if(!isEmpty(sensitiveFaceResult)){
//                                 console.log(sensitiveFaceResult.Items.ImageSensitiveFaceHitItem);
//                             }
//                         }
//                     }
//                 }else{
//                     //出错情况下打印出结果
//                     console.log(data.Code);
//                     console.log(data.Msg);
//                 }
//
//                  promis1.resolve()
//             });
//             yield promis1
//
//             function isEmpty(obj)
//             {
//                 for (var name
//                     in obj)
//                 {
//                     return false;
//                 }
//                 return true;
//             };
//
//
//
//             function contains(a, obj) {
//                 var i = a.length;
//                 while (i--) {
//                     if (a[i] === obj) {
//                         return true;
//                     }
//                 }
//                 return false;
//             }
            var url="https://leven-dev.oss-cn-shanghai.aliyuncs.com/bpmsg/dICv2BMrO2/1488965840836.jpg?Expires=1491558267&OSSAccessKeyId=STS.FMg3RirRtcoHgeiFgEgxnbtLc&Signature=K2laitKjxLqmerbihSCIWgqjuDQ%3D&security-token=CAIStwJ1q6Ft5B2yfSjIp47SeOjdn41V1K2jZUPYomcQa%2FdCjbHngTz2IHtIdHdgBuAWv%2FkxlG1Q6vwTlrcqF8YcHRyYMZMpscsHqFPwJdOd65zksOJU1cL0QzHLhcZ6WA2RMYvDV9r4VqqHZDKtz115o9bTcTGlQCb1U%2FmggoJmadI6RxSxaSE8av5dOgplrr1SVxzWLu3%2FFh%2FxnkDNB0llphEe7GRk8vaQz9G74BjTh0GAvY1znYnqJYW%2BZMRBJYp2V8zPvNZ7ba3cyiVdmXMoneVU9PUYoG6f7o3BWwAOvEXfY7vun4cxfFMjVM8TALVZqfXwr%2Fp8t9HImp7%2FoxQ3ZroJA3qPG9DwkZaaSL7xaoxob8PyP3Xcz9aALJT4tRgpe2waPw5GdtQoN3tsExsoRyEBhngqHPcvCRqAAUymGVb3eReMcOajCvQXegVGYIuGi7tag1qmd%2Fu%2B5bB61ry98nk6Aak7XoqJc%2BWKspykyn13iNYT%2F38c4XKhkh1RPgPFFtGkBVF%2Ff2EZcv7Vgx%2FHZIdb9yDyyhBKPXWZo1zc1BeERgZQgd4ywT6LXhVpZHilY15NmMnia8MfyjI1"
            var url1="https://leven-dev.oss-cn-shanghai.aliyuncs.com/bpmsg/dICv2BMrO2/1488957362654.jpg?Expires=1491553920&OSSAccessKeyId=STS.FMg3RirRtcoHgeiFgEgxnbtLc&Signature=sfXXeyeeTVW6Dbu9PbTiZb2ilOM%3D&security-token=CAIStwJ1q6Ft5B2yfSjIp47SeOjdn41V1K2jZUPYomcQa%2FdCjbHngTz2IHtIdHdgBuAWv%2FkxlG1Q6vwTlrcqF8YcHRyYMZMpscsHqFPwJdOd65zksOJU1cL0QzHLhcZ6WA2RMYvDV9r4VqqHZDKtz115o9bTcTGlQCb1U%2FmggoJmadI6RxSxaSE8av5dOgplrr1SVxzWLu3%2FFh%2FxnkDNB0llphEe7GRk8vaQz9G74BjTh0GAvY1znYnqJYW%2BZMRBJYp2V8zPvNZ7ba3cyiVdmXMoneVU9PUYoG6f7o3BWwAOvEXfY7vun4cxfFMjVM8TALVZqfXwr%2Fp8t9HImp7%2FoxQ3ZroJA3qPG9DwkZaaSL7xaoxob8PyP3Xcz9aALJT4tRgpe2waPw5GdtQoN3tsExsoRyEBhngqHPcvCRqAAUymGVb3eReMcOajCvQXegVGYIuGi7tag1qmd%2Fu%2B5bB61ry98nk6Aak7XoqJc%2BWKspykyn13iNYT%2F38c4XKhkh1RPgPFFtGkBVF%2Ff2EZcv7Vgx%2FHZIdb9yDyyhBKPXWZo1zc1BeERgZQgd4ywT6LXhVpZHilY15NmMnia8MfyjI1"
            const data = yield ctx.service.ossgreen.checkImage(url);
            // yield ctx.service.system.init_system()
            console.log(data)
            //assert(data.get('admin_bp_times') == 10);
        });

    });


});
