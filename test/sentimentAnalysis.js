'use strict';
let SentimentAnalysis = require('../lib/sentiment');

describe('Sentiment Analysis', () => {
  let sentiment;
  before(() => { 
    sentiment = new SentimentAnalysis();
  });

  it('should accept a block of text and return the sentiment analysis', (done) => {
    sentiment.scan('The weather is pretty rubbish today', (err, result) => {
      Object.keys(result).should.eql(['score', 'comparative']);
      done();
    });    
  });

});
