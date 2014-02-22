(function() {
  var todayBeerBot;

  todayBeerBot = (function() {
    function todayBeerBot() {
      var Bitly, conf, twitter;
      twitter = require('ntwitter');
      conf = require('config');
      Bitly = require("bitly");
      this.bitly = new Bitly("h5y1m141", conf.bitly);
      this.uri = "mongodb://" + conf.mongodb.db + ":" + conf.mongodb.password + "@ds033639.mongolab.com:33639/craftbeerfan";
      this._ = require('underscore');
      this.moment = require('moment');
      this.twit = new twitter({
        consumer_key: conf.consumer_key,
        consumer_secret: conf.consumer_secret,
        access_token_key: conf.access_token_key,
        access_token_secret: conf.access_token_secret
      });
      this.feedList = conf.feedList;
    }

    todayBeerBot.prototype.parseFeed = function(feed, callback) {
      var FeedParser, feedparser, items, req, request, that;
      FeedParser = require('feedparser');
      request = require('request');
      req = request(feed);
      that = this;
      feedparser = new FeedParser();
      items = [];
      req.on("error", function(error) {});
      req.on("response", function(res) {
        var stream;
        stream = this;
        if (res.statusCode !== 200) {
          return this.emit("error", new Error("Bad status code"));
        }
        stream.pipe(feedparser);
      });
      feedparser.on("error", function(error) {});
      feedparser.on("readable", function() {
        var item, meta, stream, _results;
        stream = this;
        meta = this.meta;
        _results = [];
        while (item = stream.read()) {
          if (that._checkIfFeed(item) === true) {
            _results.push(items.push(item));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
      return feedparser.on("end", function() {
        return callback(items);
      });
    };

    todayBeerBot.prototype.postBlogEntry = function(item, callback) {
      var base_url, feedType, text, that;
      feedType = item.meta["#type"];
      that = this;
      if (feedType === 'atom') {
        text = this._htmlToText(item["atom:content"]["#"]);
      } else {
        text = this._htmlToText(item["rss:description"]["#"]);
      }
      base_url = item.link;
      return this.bitly.shorten(base_url, function(err, response) {
        var postData, short_url;
        if (err) {
          postData = ("更新日" + (that.moment(item.pubDate).format("MM-DD")) + "の「" + item.meta.title + "」の情報。くわしくはWebを→ ") + base_url;
        } else {
          short_url = response.data.url;
          postData = ("更新日" + (that.moment(item.pubDate).format("MM-DD")) + "の「" + item.meta.title + "」の情報： " + text).substring(0, 110) + short_url;
        }
        return that.tweet(postData, function(data) {
          console.log("postData is done data is " + data);
          return callback(data);
        });
      });
    };

    todayBeerBot.prototype.checkIfFeedAlreadyPostOrNot = function(targetFeedURL, callback) {
      var mongo;
      mongo = require('mongodb');
      return mongo.connect(this.uri, {}, function(error, db) {
        var param;
        if (error) {
          throw error;
        }
        param = {
          "permalink": targetFeedURL
        };
        db.collection("shop").find(param).toArray(function(err, items) {
          if (err) {
            throw err;
          }
          db.close();
          if (items === null) {
            return callback([]);
          } else {
            return callback(items);
          }
        });
      });
    };

    todayBeerBot.prototype.feedAlreadyPost = function(permalink, name, callback) {
      var mongo;
      mongo = require('mongodb');
      return mongo.connect(this.uri, {}, function(error, db) {
        var param;
        if (error) {
          throw error;
        }
        param = {
          permalink: permalink,
          name: name
        };
        return setTimeout((function() {
          return db.collection("shop").insert(param, function(err, docs) {
            if (err) {
              throw err;
            }
            db.close();
            console.log(docs);
            return callback(docs);
          });
        }), 1000);
      });
    };

    todayBeerBot.prototype._checkIfFeed = function(item) {
      var currentTime, feedType, pubDate, text;
      currentTime = this.moment();
      feedType = item.meta["#type"];
      if (feedType === 'atom') {
        text = this._htmlToText(item["atom:content"]["#"]);
      } else if (feedType === 'rss') {
        text = this._htmlToText(item["rss:description"]["#"]);
      } else {
        console.log('feed type is undefined');
      }
      pubDate = this.moment(item.pubDate);
      if (this._hasCraftBeerKeyword(text) === true) {
        return true;
      } else {
        return false;
      }
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
      if (diffResult > 0 && diffResult < theLimitsOfTheTime) {
        return true;
      } else {
        return false;
      }
    };

    todayBeerBot.prototype._htmlToText = function(rawHTML) {
      var htmlToText, text;
      htmlToText = require('html-to-text');
      text = htmlToText.fromString(rawHTML, {
        wordwrap: 0
      });
      return text.replace(/[\n\r]/g, "");
    };

    return todayBeerBot;

  })();

  exports.todayBeerBot = todayBeerBot;

}).call(this);
