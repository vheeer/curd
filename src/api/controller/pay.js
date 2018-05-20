/* eslint-disable no-multi-spaces */
import Base from './base.js';
import { parseString } from 'xml2js';

module.exports = class extends Base {
  /**
   * 获取支付的请求参数
   * @returns {Promise<PreventPromise|void|Promise>}
   */
  async prepayAction() {
    const { openid, goods_id, is_an, ...values } = this.post();

    if (think.isEmpty(openid)) {
      console.log('找不到openid');
      return this.fail('微信支付失败');
    }
    // 查找用户ID
    const user = await this.model("user").field("id").where({ openid }).find();
    const { id: user_id } = user;
    // 查找对应商品
    const goods = await this.model("goods").where({ id: goods_id }).find();
    let { retail_price, prima_pic_url } = goods;
    // 时间戳
    const add_time = parseInt(Date.now()/1000);
    // 交易号
    const outTradeNo = goods_id + "_" + parseInt(Date.now()/1000) + "_" + parseInt(Math.random()*10);
    // 匿名格式转换
    const is_an_trans = is_an === true?1:0;
    // 免费商品处理
    if(retail_price === 0 || retail_price === 0.02) {
      // 添加产品（已支付状态）
      const result = await this.model("product").add({
        retail_price,
        prima_pic_url,
        user_id, 
        goods_id,
        is_an: is_an_trans,
        order_sn: outTradeNo, 
        add_time,
        is_pay: 1, //已支付
        ...values 
      });
      return this.fail("free");
    }
    // 添加产品（未支付状态）
    const result = await this.model("product").add({
      retail_price,
      prima_pic_url,
      user_id, 
      goods_id,
      is_an: is_an_trans,
      order_sn: outTradeNo, 
      add_time,
      ...values 
    });

    const WeixinSerivce = this.service('weixin', 'api');
    console.log(WeixinSerivce);
    try {
      //统一下单
      const returnParams = await WeixinSerivce.createUnifiedOrder({
        openid,
        body: '商户订单：' + outTradeNo,
        out_trade_no: outTradeNo,
        total_fee: parseInt(retail_price * 100),
        spbill_create_ip: ''
      });
      console.log("统一下单返回：", returnParams);
      return this.success(returnParams);
    } catch (err) {
      return this.fail(err);
    }
  }

  async notifyAction() {
    console.log("----------------weixin notify----------------");
    //获取字节流函数 @return promise
    function parsePostData(http) {
      return new Promise((resolve, reject) => {
        let postdata = "";
        try{
          http.req.addListener('data', data => postdata += data);
          http.req.addListener("end", () => resolve(postdata));
        }catch(err) {
          reject(err);
        }
      })
    }
    //XML字符串转对象函数 @return promise
    const xml2obj = xmlStr => new Promise((resolve, reject) => 
      parseString(xmlStr, (err, result) => resolve(result))
    );
    //验证返回结果是否正常服务
    const WeixinSerivce = this.service('weixin', 'api');
    const WS = new WeixinSerivce();

    // 获取字节流（字符串）
    const string = await parsePostData(this.http);
    console.log("notify string: ", string);
    // 字符串转对象
    const obj = await xml2obj(string);
    console.log("notify obj: ", obj);
    // 检验是否成功支付
    const result = WS.payNotify(obj['xml']);
    console.log("notify result: ", result);

    // 结果未通过检验
    if(!result)
      return this.success(`<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[支付失败]]></return_msg></xml>`);
    
    // 查找订单对应产品信息
    const { out_trade_no } = result;
    console.log("result.out_trade_no is ", result.out_trade_no);
    const productInfo = await this.model("product").where({ order_sn: out_trade_no }).find();
    
    // 如果已经收到支付成功该信息则返回错误
    if(productInfo.is_pay === 1){
      console.log("已经支付成功");
      return this.success(`<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[已经支付成功]]></return_msg></xml>`);
    }
    
    // 不存在则返回错误
    if (think.isEmpty(productInfo)) 
      return this.success(`<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[订单不存在]]></return_msg></xml>`);
    
    // 更新支付状态
    const update_result = await this.model("product").where({ order_sn: out_trade_no }).update({ is_pay: 1});
    if(!update_result);
      return this.success(`<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[订单不存在]]></return_msg></xml>`);
    
    return this.success(`<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>`);
  }
};
