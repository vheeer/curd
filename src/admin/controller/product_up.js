import Base from './base.js';
import Rest from './rest.js';
const namespace = "product_up";
const actions = Rest(namespace);

class controller extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  async indexAction(){
    //auto render template file index_index.html
    const result = await this.model(namespace).limit(10).select();
    return this.success(result);
  }
  /**
   * create request
   * @return {Promise}
   */
  async addAction() {
    const { product_id } = this.post();
    let result = await this.model(modelName).add({ 
      ...this.post(), 
      add_time: parseInt(new Date().getTime()/1000)
    });
    //添加点赞记录
    const total = await this.model(modelName).where({ product_id }).count();
    //更改产品表中的总赞数
    const updateResult = await this.model("product").where({ product_id }).update({ up: total });
    
    return this.success(result);
  }
}
Object.assign(controller.prototype, actions);
module.exports = controller;
