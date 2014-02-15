(function() {
  var todayBeerBot;

  todayBeerBot = (function() {
    function todayBeerBot() {
      var conf, twitter;
      twitter = require('ntwitter');
      conf = require('config');
      this._ = require('underscore');
      this.moment = require('moment');
      this.twit = new twitter({
        consumer_key: conf.consumer_key,
        consumer_secret: conf.consumer_secret,
        access_token_key: conf.access_token_key,
        access_token_secret: conf.access_token_secret
      });
    }

    todayBeerBot.prototype.getTweet = function(callback) {
      var params, tweets;
      tweets = [];
      params = {
        count: 100
      };
      return this.twit.verifyCredentials(function(err, data) {}).getHomeTimeline(params, function(err, data) {
        var tweet, _i, _len;
        if (err) {
          return callback(err);
        }
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          tweet = data[_i];
          if (tweet.text !== "undefined") {
            tweets.push(tweet);
          }
        }
        return callback(tweets);
      });
    };

    todayBeerBot.prototype.retweet = function(targetTweet) {
      return true;
    };

    return todayBeerBot;

  })();

  exports.todayBeerBot = todayBeerBot;

}).call(this);
