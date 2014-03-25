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
          return addTweetToACS = (function(twitterScreenName, tweet) {
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
        })(item);
      }
      return console.log("tweet check done");
    }
  });

}).call(this);
