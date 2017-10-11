/**
 * Created by leven on 17/2/23.
 */
'use strict';

exports.schedule = {
  interval: '5s',
  type: 'all',
  disable: true,

};

exports.task = function* (ctx) {

    yield ctx.service.lottery.restLotteryCount();

    console.log('asdfs')
   ctx.logger.info('all&&interval');
};
