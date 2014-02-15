path = require("path")
modulePath = path.resolve(__dirname, "../lib/todayBeerBot.js")
todayBeerBot = require(modulePath).todayBeerBot

describe 'Bot',() ->
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

  it 'should be retweet', () ->
    targetTweet =
      text:"これはテストのための投稿です本日の開栓情報"
      created_at:"Mon Aug 31 02:04:47 +0000 2009"
      name:"publican@洗足"
      id_str:"70277990"
    expect(@bot.retweet(targetTweet)).toBe true
