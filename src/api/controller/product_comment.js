import Base from './base.js';
import Rest from './rest.js';
const namespace = "product_comment";
const actions = Rest(namespace);

class controller extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  async indexAction(){
    const { product_id } = this.get();
    const comment = await this.model(namespace).where({ product_id }).select();
    return this.success(comment);
  }
  /**
   * add action
   * @return {Promise} []
   */
  async addAction(){
    console.log("addAction this.post()", this.post());
    const { openid, content, product_id } = this.post();
    const { id: user_id } = await this.model("user").field("id").where({ openid }).find();
    const result = await this.model(namespace).add({
      user_id,
      content,
      product_id,
      add_time: parseInt(Date.now()/1000)
    });
    return this.success(result);
  }
}
Object.assign(controller.prototype, actions);
module.exports = controller;
