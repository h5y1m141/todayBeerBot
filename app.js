(function() {
  var TinySegmenter, conf, modulePath, path, retweet, segmenter, twit, twitter, _;

  twitter = require('ntwitter');

  conf = require('config');

  _ = require('underscore');

  path = require("path");

  modulePath = path.resolve(__dirname, "lib/tiny_segmenter-0.2.js");

  TinySegmenter = require(modulePath).TinySegmenter;

  segmenter = new TinySegmenter();

  twit = new twitter({
    consumer_key: conf.consumer_key,
    consumer_secret: conf.consumer_secret,
    access_token_key: conf.access_token_key,
    access_token_secret: conf.access_token_secret
  });

  twit.verifyCredentials(function(err, data) {}).getHomeTimeline(function(err, data) {
    var tweet, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = data.length; _i < _len; _i++) {
      tweet = data[_i];
      if (tweet.text !== "undefined") {
        _results.push(retweet(tweet));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  });

  retweet = function(targetTweet) {
    var dict, result, segs;
    dict = ['ペールエール', 'IPA', 'COECO'];
    segs = segmenter.segment(targetTweet.text);
    result = _.intersection(segs, dict);
    if (result.length !== 0) {
      console.log(targetTweet.id_str);
      return twit.verifyCredentials(function(err, data) {}).retweetStatus(targetTweet.id_str, function(err, data) {
        return console.log(data);
      });
    }
  };

}).call(this);
