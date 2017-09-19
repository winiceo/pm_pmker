/**
 * Created by leven on 17/2/20.
 */
const moment = require('moment');
moment.locale('zh-cn');
module.exports = {
    date(date, format) {
        date = moment.unix(date);
        if (format == 1) {
            return date.fromNow();
        }
        format = format || 'MM-DD HH:mm';
        return date.format(format);

    },
    dateAt(date, format) {
        date = moment(date, moment.ISO_8601)
        if (format == 1) {
            return date.fromNow();
        }
        format = format || 'MM/DD HH:mm';
        return date.format(format);

    },
    money(money) {
        'use strict';
        return parseFloat(money).toFixed(2);
    },
    formatmoney(money, type) {
        'use strict';

        if (type == 1) {
            return `￥ ${parseFloat(money / 100).toFixed(2)}`;
        } else if (type == 2) {
            return `￥ ${parseFloat(money).toFixed(2)}`;
        } else if (type == 3) {
            return `${parseFloat(money / 100).toFixed(2)}`;
        }else{
            return `${parseFloat(money / 100).toFixed(2)}`;
        }

    },

};
