(function() {
  var bot, conf, feed, feedList, modulePath, moment, path, todayBeerBot, _i, _len;

  path = require("path");

  modulePath = path.resolve(__dirname, "lib/todayBeerBot.js");

  todayBeerBot = require(modulePath).todayBeerBot;

  conf = require('config');

  moment = require("moment");

  bot = new todayBeerBot();

  feedList = bot.feedList;

  bot.getTweet(function(items) {
    var check, item, _i, _len;
    if (items.length !== 0) {
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        check = (function(tweet) {
          if (bot._checkIfTweet(tweet) === true) {
            return bot.retweet(tweet.id_str, function(data) {
              return console.log("done text is " + data.text);
            });
          }
        })(item);
      }
      return console.log("done");
    }
  });

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
          _results.push(func = (function(permalink, name, item) {
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
                    return bot.postBlogEntry(item, function(result) {
                      return console.log(result);
                    });
                  });
                }
              } else {
                return console.log("" + result[0].permalink + " is already post");
              }
            });
          })(item.link, item.meta.title, item));
        }
        return _results;
      } else {
        return console.log("done");
      }
    });
  }

}).call(this);
