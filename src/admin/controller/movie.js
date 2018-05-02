import Base from './base.js';
import Rest from './rest.js';
const { readAction, createAction, updateAction, deleteAction, changeImageAction } = Rest("movie");

class controller extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  async indexAction(){
    //auto render template file index_index.html
    const result = await this.model("movie").limit(10).select();
    return this.success(result);
  }
}
controller.prototype.readAction = readAction;
controller.prototype.createAction = createAction;
controller.prototype.updateAction = updateAction;
controller.prototype.deleteAction = deleteAction;
controller.prototype.changeImageAction = changeImageAction;
module.exports = controller;
