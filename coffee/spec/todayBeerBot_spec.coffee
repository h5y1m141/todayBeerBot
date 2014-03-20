path = require("path")
modulePath = path.resolve(__dirname, "../lib/todayBeerBot.js")
todayBeerBot = require(modulePath).todayBeerBot

# ここからTwitter関連のテスト
xdescribe 'Bot about Twitter',() ->
  beforeEach ->
    @bot = new todayBeerBot()

    
  it 'init test',() ->
    expect(typeof @bot).toEqual("object")
    
  
  it('should be retreive tweet list', (done) ->
    @bot.getTweet( (items) ->
      expect(items.length).toEqual 100
      done()
    )  
  ,5000)    

  it('should be retweet', (done) ->
    id_str = "435170834790236160"
      
    @bot.retweet(id_str,(data) ->
      expect(typeof data).toEqual "object"
      done()
    )
  ,8000)


  it '開栓情報らしきものがツイートに含まれている場合にはtrueを返す',() ->
    contents = "本日は樽が沢山開いてます♪  『ballast Point Victory at sea』 『アウグスビール アウグスホワイト』 『湘南ビール ベルジャンゴールド』 『TYハーバー バーレーワイン" 
    expect(@bot._hasCraftBeerKeyword(contents)).toBe(true)

  it 'ツイートにビールの種類が含まれている場合にはtrueを返す',() ->
    contents = "本日は12時から17時まで短縮営業いたします！お越しの際は足元お気をつけ下さい(>_<)
☆雑穀ヴァイツェン
☆茜レッドエール
☆おがわポーター
小川町駅前はまだ雪がいっぱいです" 
    expect(@bot._hasCraftBeerKeyword(contents)).toBe(true)

  it '開栓情報でもビールの種類の情報も含まないケースはfalseを返す',() ->
    contents = "今日も仕込んでます"
    expect(@bot._hasCraftBeerKeyword(contents)).toBe false

  it '指定時間内にある情報なのでtrueが返る',() ->
    target = "Sat Feb 15 17:03:19 +0000 2014"
    currentTime = "Sat Feb 15 17:05:19 +0000 2014"

    expect(@bot._withinTheLimitsOfTheTime(target,currentTime)).toBe true
    
  it '指定時間内にないためfalseが返る',() ->
    target = "Sat Feb 15 7:03:19 +0000 2014"
    currentTime = "Sat Feb 15 17:05:19 +0000 2014"

    expect(@bot._withinTheLimitsOfTheTime(target,currentTime)).toBe false

  it 'currentTimeよりもターゲットとなる情報が先になるというのは未来を意図するためこのようなことはないはずだがこのケースでもfalseが返る',() ->
    target = "Sat Feb 15 22:03:19 +0000 2014"
    currentTime = "Sat Feb 15 17:05:19 +0000 2014"

    expect(@bot._withinTheLimitsOfTheTime(target,currentTime)).toBe false


# ここからRSS フィードに対する処理
xdescribe 'Bot about Parse RSS',() ->
  beforeEach ->
    @bot = new todayBeerBot()
    @feed = @bot.feedList[0].rss

  xit('should be POST blog entry', (done) ->
    permalink = "http://craftbeer-fan.info/"
    postData = "this is a test please ignore this tweet #{permalink}"  
    @bot.tweet(postData,(data) ->
      expect(typeof data).toEqual "object"
      done()
    )
  ,8000)

  it('should be Parse RSS feed', (done) ->

    @bot.parseFeed(@feed,(items) ->
      expect(items[0].title).toBeDefined()
      done()
    )
  ,8000)
  
  it('should be Parse RSS feed from ACS', (done) ->

    @bot.parseFeedFromACS( (items) ->
      console.log items[0].name
      console.log items[1].name
      expect(items[0].name).toBeDefined()
      # expect(items[0].name).toEqual "Sun2Diner"
      done()
    )
  ,8000)


  it 'should be convert html contents to text', () ->
    rawHTML = "12/21 (土) 本日のビール <br /><br />箕面ゴッドファーザー 2 (ベルギー柚子スタウト, 限定) <br /><br />いわて蔵 MASAJIのダンディビター (イングリッシュビター, 限定) <br /><br />湘南 IPA ブラボーシングルホップ (限定) <br /><br />木曽路 ペールエール リアルエール (限定)"
    expect(@bot._htmlToText(rawHTML)).toEqual "12/21(土)本日のビール箕面ゴッドファーザー2(ベルギー柚子スタウト,限定)いわて蔵MASAJIのダンディビター(イングリッシュビター,限定)湘南IPAブラボーシングルホップ(限定)木曽路ペールエールリアルエール(限定)"

        
  it('should be return true flg after the target feed already is posted', (done) ->
    targetFeedURL = "http://ameblo.jp/sun2diner/entry-11773725674.html"
    @bot.checkIfFeedAlreadyPostOrNot(targetFeedURL, (result) ->
      expect(result[0].permalink).toEqual targetFeedURL
      done()
    )  
  ,8000 )
  
# ここから開栓情報をACSにも登録する処理についてのテスト
describe 'ACS',() ->
  beforeEach ->
    @bot = new todayBeerBot()
    
  it '開栓情報を登録できる',(done) ->
    placdID = "520188b34cd6620ae80abc6b" # UNION BAKERY
    @bot.postBeerInfoToACS(placdID,(result) ->
      expect(result.success).toBe true
      done()
    )
  ,8000
