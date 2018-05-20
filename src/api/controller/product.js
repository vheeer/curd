import Base from './base.js';
import Rest from './rest.js';

const namespace = "product";
const actions = Rest(namespace);

class controller extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  async indexAction() {
  	const { product_id } = this.get();
    const product = await this.model(namespace).where({ id: product_id, is_pay: 1 }).find();
    console.log("product", product);
    const { user_id, goods_id } = product;

    const user = await this.model("user").where({ id: user_id }).find();
    const goods = await this.model("goods").where({ id: goods_id }).select();
    const product_comment = await this.model("product_comment").where({ product_id }).select();
    const product_up = await this.model("product_up").where({ product_id }).select();

    const service = this.service('util');
    await service.addUserInfo(this, product_comment);
    await service.addUserInfo(this, product_up);

    return this.success({ product, user, goods, product_comment, product_up });
  }
  /**
   * myup action
   * @return {Promise} []
   */
  async myupAction() {
    const { openid } = this.post();
    // 查找user_id
    const { id: user_id } = await this.model("user").field("id").where({ openid }).find();
    const myups = await this.model("product_up").field("product_id").where({ user_id }).select();
    return this.success(myups);
  }
}
Object.assign(controller.prototype, actions);
module.exports = controller;
