(function() {
  var modulePath, path, todayBeerBot;

  path = require("path");

  modulePath = path.resolve(__dirname, "../lib/todayBeerBot.js");

  todayBeerBot = require(modulePath).todayBeerBot;

  xdescribe('Bot about Twitter', function() {
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
    it('should be retweet', function(done) {
      var id_str;
      id_str = "435170834790236160";
      return this.bot.retweet(id_str, function(data) {
        expect(typeof data).toEqual("object");
        return done();
      });
    }, 8000);
    it('開栓情報らしきものがツイートに含まれている場合にはtrueを返す', function() {
      var contents;
      contents = "本日は樽が沢山開いてます♪  『ballast Point Victory at sea』 『アウグスビール アウグスホワイト』 『湘南ビール ベルジャンゴールド』 『TYハーバー バーレーワイン";
      return expect(this.bot._hasCraftBeerKeyword(contents)).toBe(true);
    });
    it('ツイートにビールの種類が含まれている場合にはtrueを返す', function() {
      var contents;
      contents = "本日は12時から17時まで短縮営業いたします！お越しの際は足元お気をつけ下さい(>_<) ☆雑穀ヴァイツェン ☆茜レッドエール ☆おがわポーター 小川町駅前はまだ雪がいっぱいです";
      return expect(this.bot._hasCraftBeerKeyword(contents)).toBe(true);
    });
    it('開栓情報でもビールの種類の情報も含まないケースはfalseを返す', function() {
      var contents;
      contents = "今日も仕込んでます";
      return expect(this.bot._hasCraftBeerKeyword(contents)).toBe(false);
    });
    it('指定時間内にある情報なのでtrueが返る', function() {
      var currentTime, target;
      target = "Sat Feb 15 17:03:19 +0000 2014";
      currentTime = "Sat Feb 15 17:05:19 +0000 2014";
      return expect(this.bot._withinTheLimitsOfTheTime(target, currentTime)).toBe(true);
    });
    it('指定時間内にないためfalseが返る', function() {
      var currentTime, target;
      target = "Sat Feb 15 7:03:19 +0000 2014";
      currentTime = "Sat Feb 15 17:05:19 +0000 2014";
      return expect(this.bot._withinTheLimitsOfTheTime(target, currentTime)).toBe(false);
    });
    return it('currentTimeよりもターゲットとなる情報が先になるというのは未来を意図するためこのようなことはないはずだがこのケースでもfalseが返る', function() {
      var currentTime, target;
      target = "Sat Feb 15 22:03:19 +0000 2014";
      currentTime = "Sat Feb 15 17:05:19 +0000 2014";
      return expect(this.bot._withinTheLimitsOfTheTime(target, currentTime)).toBe(false);
    });
  });

  describe('Bot about Parse RSS', function() {
    beforeEach(function() {
      return this.bot = new todayBeerBot();
    });
    xit('should be POST blog entry', function(done) {
      var permalink, postData;
      permalink = "http://craftbeer-fan.info/";
      postData = "this is a test please ignore this tweet " + permalink;
      return this.bot.tweet(postData, function(data) {
        expect(typeof data).toEqual("object");
        return done();
      });
    }, 8000);
    return it('should be Parse RSS feed', function(done) {
      var feedList;
      feedList = [];
      return this.bot.getRSS(function(items) {
        expect(items[0].rss).toEqual("http://catandcask.blogspot.com/feeds/posts/default");
        return done();
      });
    }, 8000);
  });

}).call(this);
