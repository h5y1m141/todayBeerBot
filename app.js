(function() {
  var bot, conf, modulePath, moment, path, todayBeerBot;

  path = require("path");

  modulePath = path.resolve(__dirname, "lib/todayBeerBot.js");

  todayBeerBot = require(modulePath).todayBeerBot;

  conf = require('config');

  moment = require("moment");

  bot = new todayBeerBot();

  bot.getTweet(function(items) {
    var check, item, _i, _len;
    if (items.length !== 0) {
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        check = (function(tweet) {
          var permalink, twitterScreenName;
          twitterScreenName = tweet.user.screen_name;
          permalink = "https://twitter.com/" + tweet.user.screen_name + "/status/" + tweet.id_str;
          console.log("tweet permalink is " + permalink);
          return bot.retweet(tweet.id_str, function(err, data) {
            if (err) {
              return console.log("already retweet");
            } else {
              if (bot._checkIfTweet(tweet) === true) {
                return bot._getPlaceIDFromACS(twitterScreenName, function(result) {
                  var placeID;
                  if (result.success && result.meta.total_pages !== 0) {
                    placeID = result.places[0].id;
                    return bot.postBeerInfoToACS(placeID, tweet, permalink, function(result) {
                      return console.log(result);
                    });
                  }
                });
              }
            }
          });
        })(item);
      }
      return console.log("tweet check done");
    }
  });

  bot.parseFeedFromACS(function(items) {
    var getFeed, item, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = items.length; _i < _len; _i++) {
      item = items[_i];
      _results.push(getFeed = (function(obj) {
        return bot.parseFeed(obj.custom_fields.feed, function(items) {
          var func, _j, _len1, _results1;
          if (items.length !== 0) {
            _results1 = [];
            for (_j = 0, _len1 = items.length; _j < _len1; _j++) {
              item = items[_j];
              _results1.push(func = (function(permalink, name, item, placeID) {
                return bot.checkIfFeedAlreadyPostOrNot(permalink, item.pubDate, function(flg) {
                  if (flg === true) {

                  } else {
                    return bot.feedAlreadyPost(permalink, name, function(docs) {
                      return bot.postBlogEntry(item, placeID, function(result) {
                        return console.log(result);
                      });
                    });
                  }
                });
              })(item.link, item.meta.title, item, obj.id));
            }
            return _results1;
          } else {
            return console.log("done");
          }
        });
      })(item));
    }
    return _results;
  });

}).call(this);
