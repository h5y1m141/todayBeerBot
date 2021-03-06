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
    return it('should be convert html contents to text', function() {
      var rawHTML;
      rawHTML = "12/21 (土) 本日のビール <br /><br />箕面ゴッドファーザー 2 (ベルギー柚子スタウト, 限定) <br /><br />いわて蔵 MASAJIのダンディビター (イングリッシュビター, 限定) <br /><br />湘南 IPA ブラボーシングルホップ (限定) <br /><br />木曽路 ペールエール リアルエール (限定)";
      return expect(this.bot._htmlToText(rawHTML)).toEqual("12/21(土)本日のビール箕面ゴッドファーザー2(ベルギー柚子スタウト,限定)いわて蔵MASAJIのダンディビター(イングリッシュビター,限定)湘南IPAブラボーシングルホップ(限定)木曽路ペールエールリアルエール(限定)");
    });
  });

  describe('ACS', function() {
    beforeEach(function() {
      this.bot = new todayBeerBot();
      return this.moment = require("moment");
    });
    it('投稿済の開栓情報の場合にはflgがtrueになる', function(done) {
      var dummyPubDate, targetFeedURL;
      targetFeedURL = "http://ameblo.jp/sun2diner/entry-11773725674.html";
      dummyPubDate = this.moment();
      return this.bot.checkIfFeedAlreadyPostOrNot(targetFeedURL, dummyPubDate, function(flg) {
        expect(flg).toBe(true);
        return done();
      });
    }, 5000);
    it('未登録の開栓情報の場合には該当flgがfalseになる', function(done) {
      var dummyFeedURL, dummyPubDate;
      dummyFeedURL = "http://craftbeer-tokyo.info/23/c/brewdog-roppongi/";
      dummyPubDate = this.moment();
      return this.bot.checkIfFeedAlreadyPostOrNot(dummyFeedURL, dummyPubDate, function(flg) {
        expect(flg).toBe(false);
        return done();
      });
    }, 5000);
    it('未登録の開栓情報だが投稿日が昔のものの場合には該当flgがtrueになる', function(done) {
      var dummyFeedURL, dummyPubDate;
      dummyFeedURL = "http://craftbeer-tokyo.info/23/c/brewdog-roppongi/";
      dummyPubDate = this.moment("2011/01/01 00:00:00");
      return this.bot.checkIfFeedAlreadyPostOrNot(dummyFeedURL, dummyPubDate, function(flg) {
        expect(flg).toBe(true);
        return done();
      });
    }, 5000);
    xit('お店のブログで発信されたる開栓情報を登録できる', function(done) {
      var name, permalink;
      permalink = "http://www.facebook.com/craftbeermarketmitukoshimae/posts/717360874982183";
      name = "CRAFT BEER Market 三越前店's Facebook Wall";
      return this.bot.feedAlreadyPost(permalink, name, function(result) {
        expect(result).toBe(true);
        return done();
      });
    }, 8000);
    xit('開栓情報を登録できる', function(done) {
      var message, placdID;
      placdID = "520188b34cd6620ae80abc6b";
      message = 'これはテストの投稿です';
      return this.bot.postBeerInfoToACS(placdID, message, function(result) {
        expect(result.success).toBe(true);
        return done();
      });
    }, 8000);
    it('Twitter IDから該当のお店のplace_idが取得できる', function(done) {
      var twitterScreenName;
      twitterScreenName = "WATERING_HOLE_";
      return this.bot._getPlaceIDFromACS(twitterScreenName, function(result) {
        if (result.success) {
          expect(result.places[0].id).toEqual("521539988839410b2801aab7");
        }
        return done();
      });
    }, 8000);
    return it('just test', function() {
      var flg;
      flg = true;
      expect(flg).toBe(true);
    });
  });

}).call(this);
