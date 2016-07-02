'use strict';
let NewsOutlet = require('../lib/news/google');
let should = require('should');

describe('Google News', () => {
  let newsOutlet;
  before(() => {
    newsOutlet = new NewsOutlet();
  });

  it('Should get news for a single symbol', (done) => {
    newsOutlet.newsFor('LON:VM', (err, articles) => {
      should.ifError(err);
      should(articles.length).eql(10);
      done();
    });
  });

  it('Should get news for multiple symbols', (done) => {
    newsOutlet.newsFor(['LON:VM', 'LON:BARC'], (err, articles) => {
      should.ifError(err);
      should(Object.keys(articles).length).eql(2);
      done();
    });
  });

});

