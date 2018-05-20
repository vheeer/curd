import Base from './base.js';
import Rest from './rest.js';
const namespace = "goods";
const actions = Rest(namespace);

class controller extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  async indexAction(){
  	const { id } = this.get();
    const goods = await this.model(namespace).where({ id }).find();
    return this.success(goods);
  }
}
Object.assign(controller.prototype, actions);
module.exports = controller;
