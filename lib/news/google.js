'use strict';
let googleFinance = require('google-finance');

function Google() {
  this.newsFor = (symbols, done) => {
    let target = (symbols instanceof Array) ? symbols : [symbols];
    googleFinance.companyNews({
      symbols: target
    }, (err, results) => {
      done(err, (symbols instanceof Array) ? results : results[symbols]);
    });
  };
  return Object.freeze(this);
}
module.exports = Google;
