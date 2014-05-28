path = require("path")
modulePath = path.resolve(__dirname, "lib/todayBeerBot.js")
todayBeerBot = require(modulePath).todayBeerBot
conf = require('config')
moment = require("moment")

bot = new todayBeerBot()
# feedList = bot.feedList

bot.getTweet (items) ->
  if items.length isnt 0
    for item in items
      check = ((tweet) ->
        # console.log "id is #{tweet.id_str} and flg is #{bot._checkIfTweet(tweet)}"
        # if bot._checkIfTweet(tweet) is true
        #   ## Tweet情報をACSのStatusesにも登録する
        #   permalink = "https://twitter.com/#{tweet.user.screen_name}/status/#{tweet.id_str}"
        #   console.log "twitter permalink is : #{permalink}"
        #   addTweetToACS = ((twitterScreenName, tweet, targetLink) ->
        #     console.log "find start. user is #{twitterScreenName} and tweet is #{tweet}"
        #     bot._getPlaceIDFromACS twitterScreenName,(result) ->
        #       if result.success and result.meta.total_pages isnt 0
        #         placeID = result.places[0].id
        #         bot.postBeerInfoToACS placeID,tweet,targetLink,(result) ->
        #           console.log result
        #   )(tweet.user.screen_name, tweet.text, permalink)
        twitterScreenName = tweet.user.screen_name
        permalink = "https://twitter.com/#{tweet.user.screen_name}/status/#{tweet.id_str}"
        console.log "tweet permalink is #{permalink}"
        bot.retweet(tweet.id_str,(err,data) ->
          if err
            console.log "already retweet"
          else  
            if bot._checkIfTweet(tweet) is true
              bot._getPlaceIDFromACS twitterScreenName,(result) ->
                if result.success and result.meta.total_pages isnt 0
                  placeID = result.places[0].id
                  bot.postBeerInfoToACS placeID,tweet,permalink,(result) ->
                    console.log result

          )          
      )(item)
    console.log "tweet check done"  
        
bot.parseFeedFromACS((items) ->
  for item in items
    # console.log item
    getFeed = ((obj) ->
      # console.log obj.name + obj.custom_fields.feed
      bot.parseFeed obj.custom_fields.feed,(items) ->
        if items.length isnt 0
          for item in items
            # クロージャー使わないと、ループが回りきった所でcheckIfFeedAlreadyPostOrNotに
            # 値が渡されてしまうためこのように処理する
            func = ((permalink,name,item,placeID)->
              # console.log "start func() permalink is #{permalink}"
              bot.checkIfFeedAlreadyPostOrNot(permalink,item.pubDate,(flg) ->
                if flg is true
                  # console.log "#{permalink} is already post or pubDate is old"
                else
                  bot.feedAlreadyPost permalink,name,(docs) ->
                    # console.log "feedAlreadyPost docs is #{docs}"
                    bot.postBlogEntry item,placeID,(result) ->
                      console.log result
    
              ) # end of checkIfFeedAlreadyPostOrNot
              
            )(item.link,item.meta.title,item,obj.id)

          
        else    
          console.log "done"
      
    )(item) # end of getFeed()
)

