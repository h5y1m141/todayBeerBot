(function() {
  var modulePath, path, todayBeerBot;

  path = require("path");

  modulePath = path.resolve(__dirname, "../lib/todayBeerBot.js");

  todayBeerBot = require(modulePath).todayBeerBot;

  describe('Bot', function() {
    beforeEach(function() {
      return this.bot = new todayBeerBot();
    });
    return it('init test', function() {
      return expect(typeof this.bot).toEqual("object");
    });
  });

}).call(this);
