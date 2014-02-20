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
    bot.parseFeed(feed.rss, function(items) {
      var currentTime, flg, item, _j, _len1, _results;
      if (items.length !== 0) {
        _results = [];
        for (_j = 0, _len1 = items.length; _j < _len1; _j++) {
          item = items[_j];
          currentTime = moment();
          flg = bot._withinTheLimitsOfTheTime(item.pubDate, currentTime, 900000);
          if (flg === true) {
            _results.push(bot.postBlogEntry(item, function(result) {
              return console.log(result);
            }));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    });
  }

}).call(this);
