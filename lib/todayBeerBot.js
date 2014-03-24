(function() {
  var todayBeerBot;

  todayBeerBot = (function() {
    function todayBeerBot() {
      var Bitly, conf, mongo, twitter;
      twitter = require('ntwitter');
      conf = require('config');
      Bitly = require("bitly");
      this.bitly = new Bitly("h5y1m141", conf.bitly);
      this.ACS = require('acs-node');
      this.loginID = conf.acs.user.id;
      this.loginPasswd = conf.acs.user.password;
      this.ACS.init(conf.acs.production);
      this.uri = "mongodb://" + conf.mongodb.db + ":" + conf.mongodb.password + "@ds033639.mongolab.com:33639/craftbeerfan";
      this._ = require('underscore');
      this.moment = require('moment');
      this.twit = new twitter({
        consumer_key: conf.consumer_key,
        consumer_secret: conf.consumer_secret,
        access_token_key: conf.access_token_key,
        access_token_secret: conf.access_token_secret
      });
      mongo = require('mongodb');
      mongo.connect(this.uri, {}, (function(_this) {
        return function(error, db) {
          if (error) {
            console.log("error is " + error);
          }
          return _this.connection = db.collection("shop");
        };
      })(this));
    }

    todayBeerBot.prototype.parseFeed = function(feed, callback) {
      var FeedParser, feedparser, items, options, req, request, that;
      FeedParser = require('feedparser');
      request = require('request');
      options = {
        url: feed,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.95 Safari/537.11'
        }
      };
      req = request(options);
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

    todayBeerBot.prototype.parseFeedFromACS = function(callback) {
      return this.ACS.Places.query({
        page: 1,
        per_page: 500,
        where: {
          feed: {
            "$ne": "null"
          }
        }
      }, function(e) {
        if (e.success) {
          return callback(e.places);
        }
      });
    };

    todayBeerBot.prototype.postBlogEntry = function(item, placeID, callback) {
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
        return that.postBeerInfoToACS(placeID, postData, function(result) {
          console.log("postBeerInfoToACS success flg is " + result.success);
          return that.tweet(postData, function(data) {
            console.log("postData is done data is " + data);
            return callback(data);
          });
        });
      });
    };

    todayBeerBot.prototype.checkIfFeedAlreadyPostOrNot = function(targetFeedURL, callback) {
      return this.ACS.Objects.query({
        classname: "onTapInfo",
        page: 1,
        per_page: 20,
        where: {
          permalink: targetFeedURL
        }
      }, function(e) {
        if (e.success) {
          return callback(e.onTapInfo);
        } else {
          return callback([]);
        }
      });
    };

    todayBeerBot.prototype.feedAlreadyPost = function(permalink, name, callback) {
      return this._login((function(_this) {
        return function(session_id) {
          return _this.ACS.Objects.create({
            classname: "onTapInfo",
            session_id: session_id,
            fields: {
              permalink: permalink,
              name: name
            }
          }, function(e) {
            console.log(e);
            if (e.success) {
              return callback(true);
            } else {
              return callback(false);
            }
          });
        };
      })(this));
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
        text = 'feed type is undefined';
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

    todayBeerBot.prototype.postBeerInfoToACS = function(placeID, message, callback) {
      var currentTime, data, that;
      data = {
        login: this.loginID,
        password: this.loginPasswd
      };
      currentTime = this.moment();
      that = this;
      return this.ACS.Users.login(data, (function(_this) {
        return function(response) {
          if (response.success) {
            return _this.ACS.Statuses.create({
              place_id: placeID,
              session_id: response.meta.session_id,
              message: message
            }, function(result) {
              return that.ACS.Places.update({
                place_id: placeID,
                session_id: response.meta.session_id,
                custom_fields: {
                  statusesUpdate: currentTime
                }
              }, function(e) {
                console.log(e);
                return callback(e);
              });
            });
          }
        };
      })(this));
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
      dict = ['本日', '開栓', '開栓情報', '樽生', '限定ビール', 'ペールエール', 'IPA', 'エール', 'Ale', 'Today', 'taps', 'Pale Ale', '箕面ビール', '箕面', 'COECO', '湘南ビール', '伊勢角屋麦酒'];
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

    todayBeerBot.prototype._login = function(callback) {
      var data;
      data = {
        login: this.loginID,
        password: this.loginPasswd
      };
      return this.ACS.Users.login(data, (function(_this) {
        return function(response) {
          if (response.success) {
            return callback(response.meta.session_id);
          } else {
            return _this.loggerRequest.info("Error to login: " + response.message);
          }
        };
      })(this));
    };

    todayBeerBot.prototype._getPlaceIDFromACS = function(twitterScreenName, callback) {
      return this.ACS.Places.query({
        page: 1,
        per_page: 1,
        where: {
          twitter: twitterScreenName
        }
      }, function(result) {
        return callback(result);
      });
    };

    return todayBeerBot;

  })();

  exports.todayBeerBot = todayBeerBot;

}).call(this);
