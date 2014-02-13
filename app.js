(function() {
  var conf, twit, twitter;

  twitter = require('ntwitter');

  conf = require('config');

  twit = new twitter({
    consumer_key: conf.consumer_key,
    consumer_secret: conf.consumer_secret,
    access_token_key: conf.access_token_key,
    access_token_secret: conf.access_token_secret
  });

  twit.verifyCredentials(function(err, data) {}).getHomeTimeline(function(err, data) {
    var tweet, _i, _len;
    for (_i = 0, _len = data.length; _i < _len; _i++) {
      tweet = data[_i];
      if (tweet.text !== "undefined") {
        console.log("name:" + tweet.user.name + " tweet:" + tweet.text);
      }
    }
  });

}).call(this);
