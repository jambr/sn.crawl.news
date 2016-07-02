'use strict';
let sentiment = require('sentiment');

function SentimentAnalysis() {
  this.scan = (body, done) => {
    let result = sentiment(body);
    result = {
      score: result.score,
      comparative: result.comparative
    };
    done(null, result);    
  };
  return Object.freeze(this);
}
module.exports = SentimentAnalysis;
