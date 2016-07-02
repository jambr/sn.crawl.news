'use strict';
let NewsGrabber = require('../lib/newsGrabber');
let KeyValueStore = require('sn.core').Default.Store;
let SentimentAnalysis = require('../lib/sentiment');

let should = require('should');
let deride = require('deride');
let async = require('async');

describe('News Grabber', () => {
  let newsGrabber, symbolStore, mockNewsOutlet, sampleArticles, publishedNewsStore, sentiment;

  before(() => {
    symbolStore = new KeyValueStore('sn:test:crawl:news:symbols');
    publishedNewsStore = new KeyValueStore('sn:test:crawl:news:publishedNews');
    sentiment = new SentimentAnalysis();
  });

  beforeEach(() => {
    symbolStore.flush();
    publishedNewsStore.flush();

    mockNewsOutlet = deride.stub(['newsFor']);
    sampleArticles = {
      'LON:VM': [{ 
        guid: 'tag:finance.google.com,cluster:http://www.hl.co.uk/shares/shares-search-results/v/virgin-money-hldgs-uk-plc-ord-gbp0.0001',
        symbol: 'LON:VM',
        title: 'Virgin Money Hldgs (UK) plc Ord GBP0.0001',
        description: 'Virgin Money Hldgs (UK) plc Ord GBP0.0001\n Hargreaves Lansdown - Nov 12, 2014 \n... * Please note that there can be occasions when the Selling price shown may be temporarily higher than the Buying price. This can sometimes happen when the stock market is closed but it can also happen at other times for a variety of reasons ...',
        summary: 'Virgin Money Hldgs (UK) plc Ord GBP0.0001\n Hargreaves Lansdown - Nov 12, 2014 \n... * Please note that there can be occasions when the Selling price shown may be temporarily higher than the Buying price. This can sometimes happen when the stock market is closed but it can also happen at other times for a variety of reasons ...',
        date: 'Wed Nov 12 2014 20:29:27 GMT+0000 (GMT)',
        link: 'http://www.hl.co.uk/shares/shares-search-results/v/virgin-money-hldgs-uk-plc-ord-gbp0.0001' 
      }], 
      'LON:BARC': [{ 
        guid: 'tag:finance.google.com,cluster:52779056336402',
        symbol: 'LON:BARC',
        title: 'Why Virgin Money Holdings (UK) PLC Looks Set To Trounce HSBC Holdings plc',
        description: 'Why Virgin Money Holdings (UK) PLC Looks Set To Trounce HSBC Holdings plc\n The Motley Fool UK - Mar 2, 2016 \nVirgin Money\'s business is flying, which is a great result for the UK government. Britain regulates its banks through the Bank of England\'s Prudential Regulation Authority (PRA) and one of the PRA\'s objectives is to facilitate effective competition in ...\nVirgin Money Shares Climb as Profit Quadruples on Lending Growth - Bloomberg\nVirgin Money targets high street as mortgages drive profit surge - Financial Times',
        summary: 'Why Virgin Money Holdings (UK) PLC Looks Set To Trounce HSBC Holdings plc\n The Motley Fool UK - Mar 2, 2016 \nVirgin Money\'s business is flying, which is a great result for the UK government. Britain regulates its banks through the Bank of England\'s Prudential Regulation Authority (PRA) and one of the PRA\'s objectives is to facilitate effective competition in ...\nVirgin Money Shares Climb as Profit Quadruples on Lending Growth - Bloomberg\nVirgin Money targets high street as mortgages drive profit surge - Financial Times',
        date: 'Wed Mar 02 2016 13:07:30 GMT+0000 (GMT)',
        link: 'http://www.fool.co.uk/investing/2016/03/02/why-virgin-money-holdings-uk-plc-looks-set-to-trounce-hsbc-holdings-plc/' 
      }]
    };

    mockNewsOutlet.setup.newsFor.toCallbackWith(null, sampleArticles);
    newsGrabber = new NewsGrabber(symbolStore, mockNewsOutlet, publishedNewsStore, sentiment);
  });

  it('should let me add symbols to watch', (done) => {
    newsGrabber.add('LON', 'VM', (err) => {
      should.ifError(err);
      symbolStore.get('LON:VM', (err, thing) => {
        should.ifError(err);
        thing.dateAdded.should.not.eql(null);
        done();
      });      
    });
  });

  it('should let me remove symbols from watch', (done) => {
    newsGrabber.add('LON', 'VM', (err) => {
      should.ifError(err);
      newsGrabber.remove('LON', 'VM', (err) => {
        should.ifError(err);
        symbolStore.get('LON:VM', (err, thing) => {
          should.ifError(err);
          should(thing).eql(null);
          done();
        });      
      });
    });
  });

  it('should get the news on a timer', (done) => { 
    async.series([
        (next) => { newsGrabber.add('LON', 'VM', next); },
        (next) => { newsGrabber.add('LON', 'BARC', next); },
        (next) => { 
          newsGrabber.start(100, (err, news) => {
            should.ifError(err);
            mockNewsOutlet.expect.newsFor.called.once();
            news.should.eql(sampleArticles);
            newsGrabber.stop();
            next();
          });
        }], done);
  });

  it('shouldnt fire the tick handler for news thats been sent already', (done) => {
    async.series([
        (next) => { newsGrabber.add('LON', 'VM', next); },
        (next) => { newsGrabber.add('LON', 'BARC', next); },
        (next) => { newsGrabber.grab(() => {
          sampleArticles['LON:VM'][0].link = 'some new link indicating a new article';
          next();
        }); },
        (next) => { newsGrabber.grab((err, news) => {
          // VM is the only one that has changed
          Object.keys(news).should.eql(['LON:VM']);
          next();
        }); }], done);
  });

  it('it should add sentiment', (done) => {
    async.series([
        (next) => { newsGrabber.add('LON', 'VM', next); },
        (next) => { newsGrabber.add('LON', 'BARC', next); },
        (next) => { newsGrabber.grab((err, news) => {
          Object.keys(news['LON:VM'][0]).indexOf('sentiment').should.not.eql(-1);
          should.ifError(err);
          next();
        }); }], done);
  });

});
