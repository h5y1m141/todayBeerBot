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
          var addTweetToACS;
          if (bot._checkIfTweet(tweet) === true) {
            addTweetToACS = (function(twitterScreenName, tweet) {
              console.log("find start. user is " + twitterScreenName + " and tweet is " + tweet);
              return bot._getPlaceIDFromACS(twitterScreenName, function(result) {
                var placeID;
                if (result.success && result.meta.total_pages !== 0) {
                  placeID = result.places[0].id;
                  return bot.postBeerInfoToACS(placeID, tweet, function(result) {
                    return console.log(result);
                  });
                }
              });
            })(tweet.user.screen_name, tweet.text);
            return bot.retweet(tweet.id_str, function(data) {
              return console.log("done text is " + data.text);
            });
          }
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
        console.log(obj.name + obj.custom_fields.feed);
        return bot.parseFeed(obj.custom_fields.feed, function(items) {
          var func, _j, _len1, _results1;
          if (items.length !== 0) {
            _results1 = [];
            for (_j = 0, _len1 = items.length; _j < _len1; _j++) {
              item = items[_j];
              _results1.push(func = (function(permalink, name, item, placeID) {
                console.log("start func() permalink is " + permalink);
                return bot.checkIfFeedAlreadyPostOrNot(permalink, function(result) {
                  var currentTime, flg;
                  if (result.length === 0) {
                    console.log("start " + permalink + " and " + item.pubDate);
                    currentTime = moment();
                    flg = bot._withinTheLimitsOfTheTime(item.pubDate, currentTime, 120000);
                    console.log("flg is " + flg + " " + item.pubDate + ", " + currentTime);
                    if (flg === true) {
                      return bot.feedAlreadyPost(permalink, name, function(docs) {
                        console.log("feedAlreadyPost docs is " + docs);
                        return bot.postBlogEntry(item, placeID, function(result) {
                          return console.log(result);
                        });
                      });
                    }
                  } else {
                    return console.log("" + result[0].permalink + " is already post");
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
