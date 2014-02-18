(function() {
  var bot, feed, feedList, modulePath, moment, path, todayBeerBot, _i, _len;

  path = require("path");

  modulePath = path.resolve(__dirname, "lib/todayBeerBot.js");

  todayBeerBot = require(modulePath).todayBeerBot;

  moment = require("moment");

  bot = new todayBeerBot();

  feedList = bot.feedList;

  for (_i = 0, _len = feedList.length; _i < _len; _i++) {
    feed = feedList[_i];
    bot.parseFeed(feed.rss, function(items) {
      var currentTime, feedType, flg, item, postData, text, _j, _len1, _results;
      if (items.length !== 0) {
        _results = [];
        for (_j = 0, _len1 = items.length; _j < _len1; _j++) {
          item = items[_j];
          currentTime = moment();
          flg = bot._withinTheLimitsOfTheTime(item.pubDate, currentTime, 900000);
          if (flg === true) {
            feedType = item.meta["#type"];
            if (feedType === 'atom') {
              text = bot._htmlToText(item["atom:content"]["#"]);
            } else {
              text = bot._htmlToText(item["rss:description"]["#"]);
            }
            postData = ("更新日" + (moment(item.pubDate).format("MM-DD")) + "の「" + item.meta.title + "」の情報： " + text).substring(0, 140);
            console.log(postData);
            _results.push(bot.tweet(postData, function(data) {
              return console.log(data);
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
