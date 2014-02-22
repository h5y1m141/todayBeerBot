(function() {
  var bot, conf, feed, feedList, modulePath, moment, path, todayBeerBot, _i, _len;

  path = require("path");

  modulePath = path.resolve(__dirname, "lib/todayBeerBot.js");

  todayBeerBot = require(modulePath).todayBeerBot;

  conf = require('config');

  moment = require("moment");

  bot = new todayBeerBot();

  feedList = bot.feedList;

  for (_i = 0, _len = feedList.length; _i < _len; _i++) {
    feed = feedList[_i];
    console.log(feed.rss);
    bot.parseFeed(feed.rss, function(items) {
      var func, item, name, permalink, targetFeedURL, _j, _len1, _results;
      if (items.length !== 0) {
        _results = [];
        for (_j = 0, _len1 = items.length; _j < _len1; _j++) {
          item = items[_j];
          targetFeedURL = item.link;
          permalink = item.link;
          name = item.meta.title;
          _results.push(func = (function(permalink, name) {
            console.log("link is " + permalink);
            return bot.checkIfFeedAlreadyPostOrNot(permalink, name, function(result) {
              if (result.length === 0) {
                return bot.feedAlreadyPost(permalink, name, function(result) {
                  var currentTime, flg;
                  console.log("" + permalink + " " + name);
                  currentTime = moment();
                  flg = bot._withinTheLimitsOfTheTime(item.pubDate, currentTime, 90000);
                  if (flg === true) {
                    return bot.postBlogEntry(item, function(result) {
                      return console.log(result);
                    });
                  }
                });
              } else {
                return console.log(result[0].permalink);
              }
            });
          })(item.link, item.meta.title));
        }
        return _results;
      } else {
        return console.log("done");
      }
    });
  }

}).call(this);
