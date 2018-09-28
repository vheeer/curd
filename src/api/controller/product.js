import Base from './base.js';
import Rest from './rest.js';

const namespace = "product";
const columns = null;
const actions = Rest(namespace);
delete actions.readAction;

class controller extends Base {
  /**
   * read request
   * @return {Promise}
   */
     async readAction() {
      console.log("this.get is ", this.get());
      try{
        const { id, key, value, page, pageSize, order } = this.get();
        let data;
        if(id && !value && !key) //按id查询
        {
          data = await this.model(namespace).field(columns).where({ id }).countSelect();
        }
        else if(!id && !value && !key) //批量查询
        {
          if(order) //按字段排序
          {
            data = await this.model(namespace).field(columns).order("id").page(page, pageSize).countSelect();
          }
          else if(!order) //默认排序
          {
            data = await this.model(namespace).field(columns).page(page, pageSize).countSelect();
          }
        }
        else if(!id && value && key) //按KV查询
        {
          //筛选规则
          const KV = {};
          switch(key)
          {
            case "nickname":
              //根据输入用户昵称查找用户id
              const keys = await this.model("user").field("id").where({'nickname': ['like', '%' + value + '%']}).select();
              
              if(keys.length === 0) //没有查到用户id
              {
                data = await this.model(namespace).field(columns).where("0").page(page, pageSize).countSelect();
              }
              else if(keys.length !== 0) //根据用户id再次查询
              {
                KV["user_id"] = ["in", []];
                keys.forEach(key => KV["user_id"][1].push(key["id"]));

                if(order) //按字段排序
                {
                  data = await this.model(namespace).field(columns).where(KV).order(order).page(page, pageSize).countSelect();
                }
                else if(!order) //默认排序
                {
                  data = await this.model(namespace).field(columns).where(KV).page(page, pageSize).countSelect();
                }
              }
              break;
            default:
              KV[key] = ['like', '%' + value + '%'];
              if(order) //按字段排序
              {
                data = await this.model(namespace).field(columns).where(KV).order("sort_order desc," + order).page(page, pageSize).countSelect();
              }
              else if(!order) //默认排序
              {
                data = await this.model(namespace).field(columns).where(KV).page(page, pageSize).countSelect();
              }
              break;
          }
        }
        if(data.data.length > 0 && typeof data.data[0].user_id === "number") //如果存在user_id就提取出昵称和头像
        {
          for(let item of data.data)
          {
            const user = await this.model("user").field("nickname, avatar").where({ id: item.user_id }).find();
            item.nickname = user.nickname;
            item.avatar = user.avatar;
          }
        }
        //过滤敏感字段
        if(data.data.length > 0)
        {
          for(let item of data.data)
          {
            delete item["session_key"];
            delete item["openid"];
          }
        }
        return this.success(data);
      }catch(e){
        console.log(e);
        return this.fail(e);
      }

    }
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
