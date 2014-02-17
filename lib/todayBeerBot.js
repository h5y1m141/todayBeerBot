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

    todayBeerBot.prototype.getRSS = function(feedList, callback) {
      var items;
      items = new Array(20);
      return callback(items);
    };

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

    todayBeerBot.prototype.retweet = function(id_str, callback) {
      return this.twit.verifyCredentials(function(err, data) {}).retweetStatus(id_str, function(err, data) {
        console.log("err is " + err + " and data is " + data);
        if (err) {
          return callback(err);
        } else {
          return callback(data);
        }
      });
    };

    todayBeerBot.prototype.tweet = function(postData, callback) {
      return this.twit.verifyCredentials(function(err, data) {}).updateStatus(postData, function(err, data) {
        console.log("err is " + err + " and data is " + data);
        if (err) {
          return callback(err);
        } else {
          return callback(data);
        }
      });
    };

    todayBeerBot.prototype._checkIfTweet = function(targetTweet) {
      var currentTime, id_str, tweetTime;
      id_str = targetTweet.id_str;
      tweetTime = this.moment(targetTweet.created_at);
      currentTime = this.moment();
      if (this._hasCraftBeerKeyword(targetTweet.text) === true && this._withinTheLimitsOfTheTime(tweetTime, currentTime) === true) {
        return true;
      } else {
        return false;
      }
    };

    todayBeerBot.prototype._hasCraftBeerKeyword = function(contents) {
      var TinySegmenter, dict, flg, modulePath, path, result, segmenter, segs;
      flg = null;
      dict = ['本日', '開栓', '開栓情報', '限定ビール', 'ペールエール', 'IPA', 'エール', '箕面ビール', '箕面', 'COECO', '湘南ビール', '伊勢角屋麦酒'];
      path = require("path");
      modulePath = path.resolve(__dirname, "tiny_segmenter-0.2.js");
      TinySegmenter = require(modulePath).TinySegmenter;
      segmenter = new TinySegmenter();
      segs = segmenter.segment(contents);
      result = this._.intersection(segs, dict);
      if (result.length !== 0) {
        flg = true;
      } else {
        flg = false;
      }
      return flg;
    };

    todayBeerBot.prototype._withinTheLimitsOfTheTime = function(target, flgTime, theLimitsOfTheTime) {
      var diffResult, timeA;
      if (theLimitsOfTheTime == null) {
        theLimitsOfTheTime = 3600;
      }
      timeA = this.moment(target);
      diffResult = this.moment(flgTime).diff(timeA) / 1000;
      console.log(" diffResult is " + diffResult);
      if (diffResult > 0 && diffResult < theLimitsOfTheTime) {
        return true;
      } else {
        return false;
      }
    };

    return todayBeerBot;

  })();

  exports.todayBeerBot = todayBeerBot;

}).call(this);
