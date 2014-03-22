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

  xdescribe('Bot about Parse RSS', function() {
    beforeEach(function() {
      this.bot = new todayBeerBot();
      return this.feed = this.bot.feedList[0].rss;
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
    it('should be Parse RSS feed', function(done) {
      return this.bot.parseFeed(this.feed, function(items) {
        expect(items[0].title).toBeDefined();
        return done();
      });
    }, 8000);
    it('should be Parse RSS feed from ACS', function(done) {
      return this.bot.parseFeedFromACS(function(items) {
        console.log(items[0].name);
        console.log(items[1].name);
        expect(items[0].name).toBeDefined();
        return done();
      });
    }, 8000);
    it('should be convert html contents to text', function() {
      var rawHTML;
      rawHTML = "12/21 (土) 本日のビール <br /><br />箕面ゴッドファーザー 2 (ベルギー柚子スタウト, 限定) <br /><br />いわて蔵 MASAJIのダンディビター (イングリッシュビター, 限定) <br /><br />湘南 IPA ブラボーシングルホップ (限定) <br /><br />木曽路 ペールエール リアルエール (限定)";
      return expect(this.bot._htmlToText(rawHTML)).toEqual("12/21(土)本日のビール箕面ゴッドファーザー2(ベルギー柚子スタウト,限定)いわて蔵MASAJIのダンディビター(イングリッシュビター,限定)湘南IPAブラボーシングルホップ(限定)木曽路ペールエールリアルエール(限定)");
    });
    return it('should be return true flg after the target feed already is posted', function(done) {
      var targetFeedURL;
      targetFeedURL = "http://ameblo.jp/sun2diner/entry-11773725674.html";
      return this.bot.checkIfFeedAlreadyPostOrNot(targetFeedURL, function(result) {
        expect(result[0].permalink).toEqual(targetFeedURL);
        return done();
      });
    }, 8000);
  });

  describe('ACS', function() {
    beforeEach(function() {
      return this.bot = new todayBeerBot();
    });
    return it('開栓情報を登録できる', function(done) {
      var message, placdID;
      placdID = "520188b34cd6620ae80abc6b";
      message = 'test';
      return this.bot.postBeerInfoToACS(placdID, message, function(result) {
        expect(result.success).toBe(true);
        return done();
      });
    }, 8000);
  });

}).call(this);
