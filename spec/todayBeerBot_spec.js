(function() {
  var modulePath, path, todayBeerBot;

  path = require("path");

  modulePath = path.resolve(__dirname, "../lib/todayBeerBot.js");

  todayBeerBot = require(modulePath).todayBeerBot;

  describe('Bot', function() {
    beforeEach(function() {
      return this.bot = new todayBeerBot();
    });
    it('init test', function() {
      return expect(typeof this.bot).toEqual("object");
    });
    it('should be retreive tweet list', function(done) {
      return this.bot.getTweet(function(items) {
        expect(items.length).toEqual(100);
        return done();
      });
    }, 5000);
    return it('should be retweet', function() {
      var targetTweet;
      targetTweet = {
        text: "これはテストのための投稿です本日の開栓情報",
        created_at: "Mon Aug 31 02:04:47 +0000 2009",
        name: "publican@洗足",
        id_str: "70277990"
      };
      return expect(this.bot.retweet(targetTweet)).toBe(true);
    });
  });

}).call(this);
