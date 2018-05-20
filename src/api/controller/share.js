import Base from './base.js';
import Rest from './rest.js';

const namespace = "share";
const actions = Rest(namespace);

class controller extends Base {
  /**
   * add action
   * @return {Promise} []
   */
  async addAction() {
    console.log("this.post: ", this.post())
    const { encryptedData, iv, openid, product_id } = this.post();
    const { session_key: sessionKey } = await this.model("user").field("session_key").where({ openid }).find();

    const service = this.service('weixin');
    const weixin = new service();
    console.log(sessionKey);

    let openGId, timestamp;
    if(encryptedData){
      const infoData = weixin.decryptUserInfoData(sessionKey, encryptedData, iv);
      openGId = infoData.openGId;
      timestamp = infoData.watermark.timestamp;
    }else{
      
    }

    const insertShareData = {
      add_time: timestamp,
      openid,
      product_id,
      gid: openGId
    }
    console.log("insertShareData", insertShareData);

    const insertShareResult = await this.model(namespace).add(insertShareData);
    return this.success(insertShareResult);
  }
  /**
   * add action
   * @return {Promise} []
   */
  async fromaddAction() {
    console.log("this.post: ", this.post())
    const { openid, product_id } = this.post();
    const service = this.service('weixin');
    const weixin = new service();

    const result = await this.model(namespace).field("id").where({ openid, product_id }).find();
    const insertShareData = {
      add_time: parseInt(Date.now()/1000),
      openid,
      product_id,
      last: result.id
    }
    console.log("insertShareData", insertShareData);

    const insertShareResult = await this.model(namespace).add(insertShareData);
    return this.success(insertShareResult);
  }
}
Object.assign(controller.prototype, actions);
module.exports = controller;
