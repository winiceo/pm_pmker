/**
 * Created by leven on 17/3/1.
 */
'use strict';
const moment = require('moment');
module.exports = app => {
    /**
     *  用户相关
     */
  class DataService extends app.Service {
    constructor(ctx) {
      super(ctx);
      this.config = this.ctx.app.config;
    }

    setting() {
      return {
        app_name: '霸啦',
        web_name: '千岸互动',
        foot_logo: '2017©71an.com 千岸互动',
        admin_el_times: 5,
        admin_bp_times: 10,
        admin_ds_times: 5,
        redpack_item: {
          min_money: 3,
          reverse_time: 10,
        },
        screen_light: 1,
        roll_speed: 1.1,
        show_num: 20,
        charge_platform: 0.39,
        charge_weixin: 0.01,

        love: [
          {
            sort: 1,
            status: 'true',
            content: '一颗不变心, 爱你到永远',
            image: app.config.env.get('ALI_OSS_HOST') + '/static/express_love/images/image_default.png',
            thumb: app.config.env.get('ALI_OSS_HOST') + '/static/express_love/images/thumb_4.png',
            name: '水晶之恋',
            video: app.config.env.get('ALI_OSS_HOST') + '/static/express_love/video/3.webm',
            header: app.config.env.get('ALI_OSS_HOST') + '/static/express_love/images/header_3.png',
          },
          {
            sort: 2,
            status: 'true',
            content: '愿得一人心, 白首不分离',
            image: app.config.env.get('ALI_OSS_HOST') + '/static/express_love/images/image_default.png',
            thumb: app.config.env.get('ALI_OSS_HOST') + '/static/express_love/images/thumb_5.png',
            name: '浪漫相伴',
            video: app.config.env.get('ALI_OSS_HOST') + '/static/express_love/video/2.webm',
            header: app.config.env.get('ALI_OSS_HOST') + '/static/express_love/images/header_2.png',
          },
          {
            sort: 3,
            status: 'true',
            content: '你是我心底永远的朱砂痣',
            image: app.config.env.get('ALI_OSS_HOST') + '/static/express_love/images/image_default.png',
            thumb: app.config.env.get('ALI_OSS_HOST') + '/static/express_love/images/thumb_6.png',
            name: '爱的表白',
            video: app.config.env.get('ALI_OSS_HOST') + '/static/express_love/video/1.webm',
            header: app.config.env.get('ALI_OSS_HOST') + '/static/express_love/images/header_1.png',
          },
          {
            sort: 4,
            status: 'true',
            content: '除了你以外,世界不存在',
            image: app.config.env.get('ALI_OSS_HOST') + '/static/express_love/images/image_default.png',
            thumb: app.config.env.get('ALI_OSS_HOST') + '/static/express_love/images/thumb_3.png',
            name: '激情如火',
            video: app.config.env.get('ALI_OSS_HOST') + '/static/express_love/video/4.webm',
            header: app.config.env.get('ALI_OSS_HOST') + '/static/express_love/images/header_4.png',
          },
          {
            sort: 5,
            status: 'true',
            content: '你心我心, 融为一心',
            image: app.config.env.get('ALI_OSS_HOST') + '/static/express_love/images/image_default.png',
            thumb: app.config.env.get('ALI_OSS_HOST') + '/static/express_love/images/thumb_2.png',
            name: '甜言蜜语',
            video: app.config.env.get('ALI_OSS_HOST') + '/static/express_love/video/5.webm',
            header: app.config.env.get('ALI_OSS_HOST') + '/static/express_love/images/header_5.png',
          },
          {
            sort: 6,
            status: 'true',
            content: '漫天花雨,只为浪漫我和你',
            image: app.config.env.get('ALI_OSS_HOST') + '/static/express_love/images/image_default.png',
            thumb: app.config.env.get('ALI_OSS_HOST') + '/static/express_love/images/thumb_1.png',
            name: '漫天花雨',
            video: app.config.env.get('ALI_OSS_HOST') + '/static/express_love/video/6.webm',
            header: app.config.env.get('ALI_OSS_HOST') + '/static/express_love/images/header_6.png',
          },
        ],
        love_item: [
          {
            duration: 30,
            fee: 60,
          },
          {
            duration: 20,
            fee: 40,
          },
          {
            duration: 520,
            fee: 520,
          },
          {
            duration: 1314,
            fee: 1314,
          },
        ],
        bp_item: [
          {
            fee: 10,
            time: 10,
          },
          {
            fee: 20,
            time: 20,
          },
          {
            fee: 30,
            time: 30,
          },
          {
            fee: 40,
            time: 40,
          },
        ],
        guest: [
          {
            name: '全体观众',
            pic: app.config.env.get('ALI_OSS_HOST') + '/static/bpds/groups.png',
            type: '2',
            sort: 10,
            is_open: 'true',
          },
          {
            name: '全体男观众',
            pic: app.config.env.get('ALI_OSS_HOST') + '/static/bpds/male_groups.png',
            type: '2',
            sort: 20,
            is_open: 'true',
          },
          {
            name: '全体女观众',
            pic: app.config.env.get('ALI_OSS_HOST') + '/static/bpds/female_groups.png',
            type: '2',
            sort: 30,
            is_open: 'true',
          },
        ],
        present: [
          {
            name: '牧羊犬',
            price: 78,
            says: '以后就它陪你睡了',
            pic: app.config.env.get('ALI_OSS_HOST') + '/static/bpds/dog.jpg',
            df: 'dog',
            bp_time: 55,
            sort: 1,
          },
          {
            name: '跑车',
            price: 88,
            says: '这车野，你开适合',
            pic: app.config.env.get('ALI_OSS_HOST') + '/static/bpds/car.jpg',
            df: 'car',
            bp_time: 34,
            sort: 2,
          },
          {
            name: '情趣内衣',
            price: 68,
            says: '这是为你定制的哦',
            pic: app.config.env.get('ALI_OSS_HOST') + '/static/bpds/bras.jpg',
            df: 'bras',
            bp_time: 44,
            sort: 3,
          },
          {
            name: '杜蕾斯',
            price: 68,
            says: '愿你“杜”过一个愉快夜晚',
            pic: app.config.env.get('ALI_OSS_HOST') + '/static/bpds/durex.jpg',
            df: 'yh',
            bp_time: 25,
            sort: 4,
          },
          {
            name: '黄瓜',
            price: 28,
            says: '这个怎么用都可以',
            pic: app.config.env.get('ALI_OSS_HOST') + '/static/bpds/cucumber.jpg',
            df: 'cucumber',
            bp_time: 77,
            sort: 5,
          },
          {
            name: '玫瑰花雨',
            price: 88,
            says: '玫瑰玫瑰我爱你',
            pic: app.config.env.get('ALI_OSS_HOST') + '/static/bpds/rose.png',
            df: 'rose',
            bp_time: 30,
            sort: 6,
          },
          {
            name: '香水',
            price: 88,
            says: '我中了你的毒',
            pic: app.config.env.get('ALI_OSS_HOST') + '/static/bpds/perfume.png',
            df: 'perfume',
            bp_time: 20,
            sort: 7,
          },
        ],
        colors: [
          {
            name: 'white',
            value: '#FFFFFF',
          },
          {
            name: 'red',
            value: '#C90000',
          },
          {
            name: 'blue',
            value: '#5A9AD4',
          },
          {
            name: 'yellow',
            value: '#FFC100',
          },
          {
            name: 'violet',
            value: '#7F43FF',
          },
          {
            name: 'pink',
            value: '#F54E91',
          },
          {
            name: 'green',
            value: '#83CC2B',
          },
        ],
      };
    }

    bpwall() {
      const data = {

        show_mobile_title: 'true',
        wall_title: '某酒吧',
        wall_bg: `${app.config.env.get('ALI_OSS_HOST')}/static/wall/image/wallbg5.png`,
        pic_size: 'middle',
        font_size: 'middle',
        admin_bp_times: 0,
        admin_el_times: 0,
        admin_ds_times: 0,
        bp_video_audit: 'false',
        roll_pic_size: 'small',
        font_color: 'white',

        bp_audit: 'false',
        bp_video: 'true',
        pron_words: [],
        bp_pic_effect: 'close',
        redpack_effect: 'open',
        wall_qrcode_type: 'system',
        wall_qrcode: '',
        startAt: moment().unix(),
      };
      return data;
    }


    }

  return DataService;
};
