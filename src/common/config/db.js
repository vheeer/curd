'use strict';
/**
 * db config
 * @type {Object}
 */
export default {
  type: 'mysql',
  adapter: {
    mysql: {
      host: '127.0.0.1',
      port: '3306',
      database: 'movie',
      user: 'root',
      password: ';Classmate1133',
      prefix: '',
      encoding: 'utf8'
    },
    mongo: {

    }
  }
};