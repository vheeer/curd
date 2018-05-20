'use strict';

export default class extends think.service.base {
  /**
   * init
   * @return {}         []
   */
  init(...args){
    super.init(...args);
  	console.log("init xxxxxxxxxxxxx");
  }
  static async addUserInfo(_that, data){
  	if(data.length > 0 && typeof data[0].user_id === "number") //如果存在user_id就提取出昵称和头像
    {
      for(let item of data)
      {
        const user = await _that.model("user").field("nickname, avatar").where({ id: item.user_id }).find();
        item.nickname = user.nickname;
        item.avatar = user.avatar;
      }
    }
  }
}