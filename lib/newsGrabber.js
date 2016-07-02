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
      dateAdded: Date.now(),
      publishedNews: []
    }, done);
  };

  this.remove = (exchange, ticker, done) => {
    debug(`removing ${exchange}:${ticker} from watch list`);
    store.remove(`${exchange}:${ticker}`, done);
  };

  this.grab = (done) => {
    let symbols;
    let keys;

    let handleNewsResults = (news, next) => {
      let newsToReturn = {};

      let processNewsBySymbol = (symbol, nextSymbol) => {
        let addToResult = (articleId, article) => {
          symbols[symbol].publishedNews.push(articleId);
          if(newsToReturn[symbol] === undefined || newsToReturn[symbol] === null) {
            newsToReturn[symbol] = [];
          } 
          newsToReturn[symbol].push(article);
        };

        let idempotentPublish = (article) => {
          let articleId = article.link;
          let publishedNews = symbols[symbol].publishedNews;
          if(publishedNews.indexOf(articleId) === -1) {
            addToResult(articleId, article);
          }
        };

        let processArticleForSymbol = (article, nextArticle) => {
          idempotentPublish(article);
          nextArticle();
        };

        let articles = news[symbol];
        async.forEach(articles, processArticleForSymbol, (err) => {
          if(err) { return nextSymbol(err); }
          store.set(symbol, symbols[symbol], nextSymbol);
        });
      };

      async.forEach(Object.keys(news), processNewsBySymbol, (err) => {
        next(err, newsToReturn);
      });
    };

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
        newsOutlet.newsFor,
        handleNewsResults
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
