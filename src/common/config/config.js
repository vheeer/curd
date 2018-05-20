// default config
const API_codeForSession_key = "https://api.weixin.qq.com/sns/jscode2session";
const API_prepay = "https://api.mch.weixin.qq.com/pay/unifiedorder";
const wxKey = "192006250b4c09247ec02edce69f6a2d";
const myIp = "111.30.252.31";

const partner_key = "dapingkejiviewdapingkejiviewdapi";
let appid = "wx60cd30716bb200dd";
let secret = "0e04535e5bb46f254b6f582490f186ff";
let mch_id = "1494794472";
let notify_url = "https://www.dapingkeji.club/curd/api/pay/notify";
module.exports = {
  default_module: 'admin',
  default_controller: 'goods', 
  default_action: 'list',
  file_path: "https://www.dapingkeji.club/curd/files",
  weixin: {
    appid, // 小程序 appid
    secret, // 小程序密钥
    mch_id, // 商户帐号ID
    partner_key, // 微信支付密钥
    notify_url,// 微信异步通知，例：https://www.nideshop.com/api/pay/notify
  }
};
