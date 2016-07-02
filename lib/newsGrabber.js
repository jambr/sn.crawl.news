'use strict';
let DebugFactory = require('sn.core').DebugFactory;
let debugFactory = new DebugFactory();
let debug = debugFactory.give('sn:crawl:news:newsGrabber');
let async = require('async');

function NewsGrabber(symbolStore, newsOutlet, publishedNewsStore, sentiment) {
  let ticker;
  this.add = (exchange, ticker, done) => {
    debug(`adding ${exchange}:${ticker} to watch list`);

    symbolStore.set(`${exchange}:${ticker}`, {
      dateAdded: Date.now()
    }, done);
  };

  this.remove = (exchange, ticker, done) => {
    let id = `${exchange}:${ticker}`;
    debug(`removing ${id} from watch list`);
    async.series([
      (next) => { symbolStore.remove(id, next); },
      (next) => { publishedNewsStore.remove(id, next); }
    ], done);
  };

  this.grab = (done) => {
    let symbols;
    let keys;
    let publishedNews;

    let handlePublishedNews = (news, next) => {
      publishedNews = news || {};
      next();
    };

    let handleNewsResults = (news, next) => {
      let newsToReturn = {};

      let processNewsBySymbol = (symbol, nextSymbol) => {
        let publishedNewsForSymbol = publishedNews[symbol];
        if(publishedNewsForSymbol === undefined || publishedNewsForSymbol === null) {
          publishedNewsForSymbol = [];
        } 

        let addToPublishedNews = (articleId, next) => {
          publishedNewsForSymbol.push(articleId);
          next();
        };

        let addToResult = (articleId, article, next) => {
          if(newsToReturn[symbol] === undefined || newsToReturn[symbol] === null) {
            newsToReturn[symbol] = [];
          } 
          newsToReturn[symbol].push(article);
          next();
        };

        let addSentiment = (article, next) => { 
          sentiment.scan(article.summary, (err, sent) => {
            article.sentiment = sent;
            next();
          });
        };

        let idempotentPublish = (article, nextArticle) => {
          let articleId = article.link;
          if(publishedNewsForSymbol === undefined || publishedNewsForSymbol.indexOf(articleId) === -1) {
            return async.series([
              (next) => { addSentiment(article, next); },
              (next) => { addToResult(articleId, article, next); },
              (next) => { addToPublishedNews(articleId, next); }
            ], nextArticle);
          }
          nextArticle();
        };

        let processArticleForSymbol = (article, nextArticle) => {
          idempotentPublish(article, nextArticle);
        };

        let articles = news[symbol];
        async.forEach(articles, processArticleForSymbol, (err) => {
          if(err) { return nextSymbol(err); }
          publishedNewsStore.set(symbol, publishedNewsForSymbol, nextSymbol);
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
        publishedNewsStore.getAll,
        handlePublishedNews,
        symbolStore.getAll,
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
