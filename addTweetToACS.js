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
          console.log(tweet.user.screen_name);
          if (bot._checkIfTweet(tweet) === true) {
            return console.log("start");
          }
        })(item);
      }
      return console.log("tweet check done");
    }
  });

}).call(this);
