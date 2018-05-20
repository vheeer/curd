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
    const { product_id } = this.get();
    const up = await this.model(namespace).where({ product_id }).select();
    return this.success(up);
  }
  /**
   * add action
   * @return {Promise} []
   */
  async addAction(){
    console.log("addAction this.post()", this.post());
    const { openid, product_id } = this.post();
    // 查找user_id
    const { id: user_id } = await this.model("user").field("id").where({ openid }).find();
    // 添加记录
    const result = await this.model(namespace).thenAdd({
      user_id,
      product_id,
      add_time: parseInt(Date.now()/1000)
    },{
    	user_id,
      	product_id
    });
    if(result.type === "add"){
      // 更新点赞总数
      let { up } = await this.model("product").field("up").where({ id: product_id }).find();
      up ++;
      const result_1 = await this.model("product").where({ id: product_id }).update({ up });
    }else if(result.type === "exist"){

    }
    return this.success("success");
  }
}
Object.assign(controller.prototype, actions);
module.exports = controller;
