'use strict';
const _ = require('lodash');
const Parse = require('../lib/parse');
const moment = require('moment');
const RedPackage = Parse.Object.extend('RedPackage');
const UserRed = Parse.Object.extend('UserRed');
const is = require('is-type-of');
const assert = require('assert');
const ALY = require("aliyun-sdk")
let Green = {}
//["porn", "ad", "ocr", "illegal", "qrcode", "sensitiveFace"];

module.exports = app => {
    /**
     * 绿网，过滤
     */
    class OssGreenService extends app.Service {
        constructor(ctx) {
            super(ctx);
            this.env = this.app.config.env;
            Green = new ALY.GREEN({

                accessKeyId: this.env.get('ALI_OSS_ID'),
                secretAccessKey: this.env.get('ALI_OSS_SECRET'),
                endpoint: 'http://green.cn-hangzhou.aliyuncs.com',
                apiVersion: '2016-12-16'
            });

        }
        /**
         *
         *
         * 同步调用只支持单张图片
         *
         * 同步图片检测支持多个场景, 但不建议一次设置太多场景:
         * porn:  黄图检测
         * ocr:  ocr文字识别
         * illegal: 暴恐敏感检测
         * qrcode: 二维码识别
         * ad: 牛皮藓广告识别结果
         * sensitiveFace: 敏感人脸识别
         */


        * checkImage(url) {

            if(url.indexOf('bpmsg')==-1){
                return true;
            }
            const scenes = ["porn",   "ocr", "illegal" ];
            var urls = [url];
            var promise=new Parse.Promise()
//             var promis1=new Parse.Promise()
            Green.imageDetection({
                    Async: false,
                    ImageUrl: JSON.stringify(urls),
                    Scene: JSON.stringify(scenes)
                },
                function (err, data) {
                    if (err) {
                        console.log('error:', err);
                        return;
                    }
                    promise.resolve(data)




                }
            );

            const data= yield promise
            const ret={
                ok:true
            }

           console.log((data));
            //判断是否成功
            if (data.Code === 'Success' && data.ImageResults.ImageResult.length > 0) {
                var imageResult = data.ImageResults.ImageResult[0];
                var imageUrl = imageResult.ImageName;
                var taskId = imageResult.TaskId;

                //获取结果
                var pornResult = imageResult.PornResult;
                var ocrResult = imageResult.OcrResult;
                var illegalResult = imageResult.IllegalResult;
                var sensitiveFaceResult = imageResult.SensitiveFaceResult;
                var adResult = imageResult.AdResult;
                var qrcodeResult = imageResult.QrcodeResult;

                /**
                 * 黄图检测结果
                 */
                if (contains(scenes, "porn")) {
                    /**
                     * 黄图分值, 0-100
                     */
                    ret.porn=pornResult
                    ret.ok=pornResult.Label==0

                    console.log(pornResult.Rate);
                    /**
                     * 绿网给出的建议值, 0表示正常，1表示色情，2表示需要review
                     */
                    console.log(pornResult.Label);
                }

                /**
                 * ocr识别结果
                 */
                if (contains(scenes, "ocr")) {
                    console.log(ocrResult.Text);
                    ret.ocr=ocrResult.Text
                }

                /**
                 * 暴恐敏感识别结果
                 */
                if (contains(scenes, "illegal")) {
                    /**
                     * 分值, 0-100
                     */
                    ret.illegal=illegalResult
                    console.log(illegalResult.Rate);
                    /**
                     * 绿网给出的建议值, 0表示正常，1表示命中暴恐渉政，2表示需要review
                     */
                    console.log(illegalResult.Label);
                }

                /**
                 * 牛皮藓广告识别结果
                 */
                if (contains(scenes, "ad")) {
                    /**
                     * 分值, 0-100
                     */
                    ret.ad=adResult
                    console.log(adResult.Rate);
                    /**
                     * 绿网给出的建议值, 0表示正常，1表示广告，2表示需要review
                     */
                    console.log(adResult.Label);
                    /**
                     * 风险: 0:正常, 1:图片带文字, 2:二维码, 3: 图片有文字且有二维码
                     */
                    console.log(adResult.RiskType);

                    //如果是二维码, 可获取到二维码内容
                    console.log(adResult.RiskDetails);
                }

                /**
                 * 二维码识别结果
                 */
                if (contains(scenes, "qrcode")) {
                    ret.qrcode=qrcodeResult
                    console.log(qrcodeResult.QrcodeList);
                }

                /**
                 * 人脸识别结果
                 */
                if (contains(scenes, "sensitiveFace")) {
                    console.log(sensitiveFaceResult.Items.ImageSensitiveFaceHitItem);
                }
            } else {
                //出错情况下打印出结果
                console.log(data.Code);
                console.log(data.Msg);
            }
            return ret.ok


        }


    }

    return OssGreenService;
};







function contains(a, obj) {
    var i = a.length;
    while (i--) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}