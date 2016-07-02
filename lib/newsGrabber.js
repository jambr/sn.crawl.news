'use strict';
let DebugFactory = require('sn.core').DebugFactory;
let debugFactory = new DebugFactory();
let debug = debugFactory.give('sn:crawl:news:newsGrabber');
let async = require('async');

function NewsGrabber(store, newsOutlet) {
  let ticker;
  this.add = (exchange, ticker, done) => {
    debug(`adding ${exchange}:${ticker} to watch list`);

    store.set(`${exchange}:${ticker}`, {
      dateAdded: Date.now()
    }, done);
  };

  this.remove = (exchange, ticker, done) => {
    debug(`removing ${exchange}:${ticker} from watch list`);
    store.remove(`${exchange}:${ticker}`, done);
  };

  this.grab = (done) => {
    let symbols;
    let keys;

    let handleStoreGet = (results, next) => {
      symbols = results;
      if(symbols === undefined || symbols === null) {
        return done(null, []);
      }
      keys = Object.keys(symbols);
      next(null, keys);
    };

    async.waterfall([
        store.getAll,
        handleStoreGet,
        newsOutlet.newsFor
    ], done);
  };

  this.start = (interval, tickHandler) => {
    ticker = setInterval(() => {
      this.grab(tickHandler);
    }, interval);
  };

  this.stop = () => {
    clearInterval(ticker);
  };

  return Object.freeze(this);
}
module.exports = NewsGrabber;
