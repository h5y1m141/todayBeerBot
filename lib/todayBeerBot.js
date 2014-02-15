(function() {
  var todayBeerBot;

  todayBeerBot = (function() {
    function todayBeerBot() {
      return;
    }

    todayBeerBot.prototype.getTweet = function(callback) {
      var tweets;
      tweets = new Array(200);
      return callback(tweets);
    };

    return todayBeerBot;

  })();

  exports.todayBeerBot = todayBeerBot;

}).call(this);
