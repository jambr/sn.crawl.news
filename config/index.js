'use strict';
let env = process.env.APP_ENV || 'local';
console.log('using environment: ' + env);
module.exports = require('./' + env);
