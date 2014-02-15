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
    return it('should be retreive tweet list', function(done) {
      return this.bot.getTweet(function(items) {
        expect(items.length).toEqual(100);
        return done();
      });
    }, 5000);
  });

}).call(this);
