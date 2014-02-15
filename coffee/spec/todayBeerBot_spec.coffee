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
