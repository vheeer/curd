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
  a(x){
  	console.log("xxxxxxxxxxxxx");
  }
}