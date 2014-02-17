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
describe 'Bot about Parse RSS',() ->
  beforeEach ->
    @bot = new todayBeerBot()


  xit('should be POST blog entry', (done) ->
    permalink = "http://craftbeer-fan.info/"
    postData = "this is a test please ignore this tweet #{permalink}"  
    @bot.tweet(postData,(data) ->
      expect(typeof data).toEqual "object"
      done()
    )
  ,8000)

  it('should be Parse RSS feed', (done) ->

    @bot.getRSS((items) ->
      expect(items[0].title).toBeDefined()
      done()
    )
  ,8000)
    
