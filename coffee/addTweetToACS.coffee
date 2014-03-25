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
        #
        
        addTweetToACS = ((twitterScreenName, tweet) ->
          console.log "find start. user is #{twitterScreenName} and tweet is #{tweet}"
          bot._getPlaceIDFromACS twitterScreenName,(result) ->
            if result.success and result.meta.total_pages isnt 0
              placeID = result.places[0].id
              bot.postBeerInfoToACS placeID,tweet,(result) ->
                console.log result


        )(tweet.user.screen_name, tweet.text)  

        # if bot._checkIfTweet(tweet) is true
        #   console.log "start name is #{tweet.user.screen_name}"
        #   addTweetToACS = ((twitterScreenName,message) ->
        #     console.log "find start. user is #{twitterScreenName}"
        #     bot._getPlaceIDFromACS twitterScreenName,(result) ->
        #       if result.success and result.meta.total_pages isnt 0
        #         console.log result.places
        #         placeID = result.places[0].id
                
        #         bot.postBeerInfoToACS result.id,message,(result) ->
        #           console.log result


        #   )(tweet.user.screen_name,tweet.description)  
        #   # bot.retweet(tweet.id_str,(data) ->
        #   #   console.log "done text is #{data.text}"
        #   # )        
    
      )(item)
    console.log "tweet check done"  
