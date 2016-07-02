'use strict';
let async = require('async');

function MessageBridge(broker, newsGrabber) { 
  this.start = (started) => {
    broker.subscribePersistent(
        'sn.picker.symbol.*', 
        'sn.crawl.news',
        (message, meta, ack) => {
          switch(meta.routingKey) {
            case 'sn.picker.symbol.create':
              newsGrabber.add(message.exchange, message.symbol, ack);       
              break;
            case 'sn.picker.symbol.delete':
              newsGrabber.remove(message.exchange, message.symbol, ack);
              break;
          }
        }, started);
    newsGrabber.start(10000, (err, results) => {
      Object.keys(results).forEach(key => {
        let articles = results[key];
        articles.forEach(article => {
          broker.publish('sn.news.article.create', article);
        });
      });
    });
  };
  this.stop = (stopped) => {
    async.series([
        newsGrabber.stop,
        broker.stop
    ], stopped);
  };
  return Object.freeze(this);
}
module.exports = MessageBridge;
