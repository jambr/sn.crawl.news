'use strict';
let Broker = require('sn.core').Default.Broker;
let KeyValueStore = require('sn.core').Default.Store;
let MessageBridge = require('./lib/messageBridge');
let NewsGrabber = require('./lib/newsGrabber');
let NewsOutlet = require('./lib/news/google');
let Sentiment = require('./lib/sentiment');

let config = require('./config');
let broker = new Broker('sn:topic', config.rabbitmq);
let symbolStore = new KeyValueStore('sn:crawl:news:symbols', config.redis);
let publishedNewsStore = new KeyValueStore('sn:crawl:news:publishedNews', config.redis);
let newsOutlet = new NewsOutlet();
let sentiment = new Sentiment();
let newsGrabber = new NewsGrabber(symbolStore, newsOutlet, publishedNewsStore, sentiment);
 
let messageBridge = new MessageBridge(broker, newsGrabber);
messageBridge.start(() => {
  console.log('News watch started...');
});
