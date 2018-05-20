import Base from './base.js';
import Rest from './rest.js';
import crypto from 'crypto';
import request from 'request';

const appid = think.config("weixin.appid");
const secret = think.config("weixin.secret");

const getOpenId = url => new Promise(function(resovle, reject){
    request.get(url, (error, response, _body) => {
        console.log("openid && session_key: ", _body);
        let body = JSON.parse(_body);
        resovle({ error, response, body });
    });
});



function WXBizDataCrypt(appId, sessionKey) {
  this.appId = appId
  this.sessionKey = sessionKey
}

WXBizDataCrypt.prototype.decryptData = function (encryptedData, iv) {
  // base64 decode
  var sessionKey = new Buffer(this.sessionKey, 'base64')
  encryptedData = new Buffer(encryptedData, 'base64')
  iv = new Buffer(iv, 'base64')

  try {
     // 解密
    var decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv)
    // 设置自动 padding 为 true，删除填充补位
    decipher.setAutoPadding(true)
    var decoded = decipher.update(encryptedData, 'binary', 'utf8')
    decoded += decipher.final('utf8')
    
    decoded = JSON.parse(decoded)

  } catch (err) {
    throw new Error('Illegal Buffer')
  }

  if (decoded.watermark.appid !== this.appId) {
    throw new Error('Illegal Buffer')
  }

  return decoded
}

const namespace = "user";
const actions = Rest(namespace);

class controller extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  async indexAction(){
    const { user_id } = this.get();
    const comment = await this.model(namespace).where({ id: user_id }).select();
    return this.success(comment);
  }

  async addAction() {
    console.log("user/add post: ", this.post());
    const { code, username, gender, nickName, avatarUrl, country, language, province, city } = this.post();;
    //通过code,GET获取openid和session_key
    const wxCodeAPI = "https://api.weixin.qq.com/sns/jscode2session";
    const url = wxCodeAPI + "?appid=" + appid + "&secret=" + secret + "&js_code=" + code + "&grant_type=" + "&authorization_code";
    const { body } = await getOpenId(url);
    const { openid, session_key } = body;
    const now = parseInt(Date.now()/1000, 10);

    const userInfo = {
      username,
      gender,
      nickname: nickName,
      avatar: avatarUrl,
      country,
      language,
      province,
      city,
      openid,
      session_key,
      last_login_time: now
    }
    console.log("userInfo", userInfo);

    const find = await this.model(namespace).where({ openid }).find();

    let result;
    if(think.isEmpty(find)){
      console.log("没有用户信息");
      userInfo['add_time'] = now;
      result = await this.model(namespace).add(userInfo);
    }else{
      console.log("存在此用户");
      result = await this.model(namespace).where({ openid: userInfo.openid }).update(userInfo);
    }

    this.success({ result, openid });
  }

  async postNumberAction() {
    const user = this.model('user');
    const { openid, encryptedData, iv } = this.post(); 

    const userInfo = await user.where({ openid }).order('id desc').limit(1).select();
    const { session_key } = userInfo[0];

    const appId = appid;
    const sessionKey = session_key;

    console.log("appId", appId);
    console.log("sessionKey", sessionKey);
    console.log("encryptedData", encryptedData);
    console.log("iv", iv);

    var pc = new WXBizDataCrypt(appId, sessionKey);
    var data = pc.decryptData(encryptedData , iv);
    const { purePhoneNumber } = data;
    console.log('解密后 data: ', data);
    if(purePhoneNumber){
      const result = await user.where({ openid }).update({ mobile: purePhoneNumber });
      this.success(purePhoneNumber);
    }else{
      this.fail();
    }
  }

}
Object.assign(controller.prototype, actions);
module.exports = controller;
