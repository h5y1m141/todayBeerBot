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
        if bot._checkIfTweet(tweet) is true
          ## Tweet情報をACSのStatusesにも登録する
          addTweetToACS = ((twitterScreenName, tweet) ->
            console.log "find start. user is #{twitterScreenName} and tweet is #{tweet}"
            bot._getPlaceIDFromACS twitterScreenName,(result) ->
              if result.success and result.meta.total_pages isnt 0
                placeID = result.places[0].id
                bot.postBeerInfoToACS placeID,tweet,(result) ->
                  console.log result
          )(tweet.user.screen_name, tweet.text)
          
          bot.retweet(tweet.id_str,(data) ->
            console.log "done text is #{data.text}"
          )          
      )(item)
    console.log "tweet check done"  
        
bot.parseFeedFromACS((items) ->
  for item in items
    getFeed = ((obj) ->
      console.log obj.name + obj.custom_fields.feed
      bot.parseFeed obj.custom_fields.feed,(items) ->
        if items.length isnt 0
          for item in items
            # クロージャー使わないと、ループが回りきった所でcheckIfFeedAlreadyPostOrNotに
            # 値が渡されてしまうためこのように処理する
            func = ((permalink,name,item,placeID)->
              console.log "start func() permalink is #{permalink}"
              bot.checkIfFeedAlreadyPostOrNot(permalink,(result) ->
                if result.length is 0
                  console.log "start #{permalink} and #{item.pubDate}"
                  # 取得済であることを意図するためにMongoDBにPermalinkの情報を追加する
                  currentTime = moment()
                  flg = bot._withinTheLimitsOfTheTime(item.pubDate,currentTime,120000)
                  console.log "flg is #{flg} #{item.pubDate}, #{currentTime}"
                  if flg is true
                    bot.feedAlreadyPost(permalink,name,(docs) ->
                      console.log "feedAlreadyPost docs is #{docs}"
                      bot.postBlogEntry item,placeID,(result) ->
                        console.log result
                    )
                else  
                  console.log "#{result[0].permalink} is already post"
    
              )
              
            )(item.link,item.meta.title,item,obj.id)  
        else    
          console.log "done"
      
    )(item) # end of getFeed()
    
)      
# for feed in feedList
#   console.log feed.rss
#   bot.parseFeed feed.rss,(items) ->
#     if items.length isnt 0
#       for item in items
#         targetFeedURL = item.link

#         # Tweet済かどうかチェックして、かつ、取得したFeedの更新日が指定の時間内に
#         # 収まってるかどうか書くにした上で投稿する
#         permalink = item.link
#         name = item.meta.title
#         # クロージャー使わないと、ループが回りきった所でcheckIfFeedAlreadyPostOrNotに
#         # 値が渡されてしまうためこのように処理する
#         func = ((permalink,name,item)->
#           bot.checkIfFeedAlreadyPostOrNot(permalink,(result) ->
#             if result.length is 0
#               console.log "start #{permalink} and #{item.pubDate}"
#               # 取得済であることを意図するためにMongoDBにPermalinkの情報を追加する
#               currentTime = moment()
#               flg = bot._withinTheLimitsOfTheTime(item.pubDate,currentTime,120000)
#               console.log "flg is #{flg} #{item.pubDate}, #{currentTime}"
#               if flg is true
#                 bot.feedAlreadyPost(permalink,name,(docs) ->
#                   console.log "feedAlreadyPost docs is #{docs}"
#                   bot.postBlogEntry item,(result) ->
#                     console.log result
#                 )
#             else  
#               console.log "#{result[0].permalink} is already post"

#           )
          
#         )(item.link,item.meta.title,item)  

#     else    
#       console.log "done"

      

