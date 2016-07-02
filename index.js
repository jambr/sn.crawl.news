'use strict';
let Broker = require('sn.core').Default.Broker;
let KeyValueStore = require('sn.core').Default.Store;
let MessageBridge = require('./lib/messageBridge');
let NewsGrabber = require('./lib/newsGrabber');
let NewsOutlet = require('./lib/news/google');

let broker = new Broker('sn:topic');
let symbolStore = new KeyValueStore('sn:crawl:news:symbols');
let publishedNewsStore = new KeyValueStore('sn:crawl:news:publishedNews');
let newsOutlet = new NewsOutlet();
let newsGrabber = new NewsGrabber(symbolStore, newsOutlet, publishedNewsStore);
 
let messageBridge = new MessageBridge(broker, newsGrabber);
messageBridge.start(() => {
  console.log('News watch started...');
});
