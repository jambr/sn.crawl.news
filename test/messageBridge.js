'use strict';
let MessageBridge = require('../lib/messageBridge');
let Broker = require('sn.core').Default.Broker;

let deride = require('deride');
let should = require('should');

describe('Message Bridge', () => {
  let messageBridge, broker, mockNewsGrabber;
  beforeEach(() => {
    mockNewsGrabber = deride.stub(['add', 'start']);
    broker = new Broker('stocknet.topic.test');
    messageBridge = new MessageBridge(broker, mockNewsGrabber);
  });
  afterEach(done => {
    broker.reset(done);
  });

  it('should subscribe to picker symbol creates and save to the news grabber', (done) => {
    mockNewsGrabber.setup.add.toDoThis((exchange, ticker, ack) => {
      should(exchange).eql('LON');
      should(ticker).eql('VM');
      ack();
      done();
    });
    messageBridge.start(() => {
      broker.publish('sn.picker.symbol.create', {
        id: 'LON:VM', 
        exchange: 'LON', 
        symbol: 'VM'
      });
    });
  });

  it('should publish price changes to the world', (done) => {
    mockNewsGrabber.setup.start.toDoThis((interval, handler) => {
      setTimeout(() => {
        handler(null, { 'LON:VM': ['some market news'] });
      }, 100);
    });

    messageBridge.start(() => {
      broker.subscribe('sn.news.article.create', (message) => {
        should(message).eql('some market news');
        done();
      });
    });

  });

});
