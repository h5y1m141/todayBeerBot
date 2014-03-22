path = require("path")
modulePath = path.resolve(__dirname, "lib/todayBeerBot.js")
todayBeerBot = require(modulePath).todayBeerBot
conf = require('config')
moment = require("moment")

bot = new todayBeerBot()

bot.getTweet (items) ->
  if items.length isnt 0
    for item in items
      check = ((tweet) ->
        # console.log "id is #{tweet.id_str} and flg is #{bot._checkIfTweet(tweet)}"
        console.log tweet.user.screen_name
        
        if bot._checkIfTweet(tweet) is true
          console.log "start"
          # bot.retweet(tweet.id_str,(data) ->
          #   console.log "done text is #{data.text}"
          # )        
    
      )(item)
    console.log "tweet check done"  
