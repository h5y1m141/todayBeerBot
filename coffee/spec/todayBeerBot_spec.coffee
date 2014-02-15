path = require("path")
modulePath = path.resolve(__dirname, "../lib/todayBeerBot.js")
todayBeerBot = require(modulePath).todayBeerBot

describe 'Bot',() ->
  beforeEach ->
    @bot = new todayBeerBot()

    
  it 'init test',() ->
    expect(typeof @bot).toEqual("object")

