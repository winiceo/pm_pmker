const _ = require('lodash')
module.exports = function (goods, threshold) {

    let ret={}
    let tal = 0


    _.forEach(goods, function (n, key) {
        tal += n.stock
    });

    ret.total=tal
    let num = tal*100 / threshold; // 随机数范围 = 礼品总数 / 总中奖率
    ret.num=num
    let random = Math.round(Math.random() * (num-1));
// 随机数发生在没中奖的范围
    ret.random=random
    ret.result=-1
    if (random >= num) {
        ret.result=-1

    } else {
        let cur = 0;
        for (let j = 0; j < goods.length; j++) {
            let next = cur + goods[j].stock;
            // 随机数落在奖品的区间
            if (cur <= random && random < next) {
                // 所落的区间，礼品没库存了
                // if(goods[j].stock <= 0){
                //     console.log('【没库存】第'+i+'次中奖: '+goods[j].name+', 随机数是'+random);
                //     lucks[3].luck += 1; // 库存没了,不中奖
                //     break;
                // }
                // // 中奖
                // console.log('第'+i+'次中奖: '+goods[j].name+', 随机数是'+random);
                // goods[j].stock -= 1; // 中奖减库存
                // lucks[j].luck += 1;
                ret.result=j
                break;
            }
            cur = next;
        }
    }
    return ret;
}