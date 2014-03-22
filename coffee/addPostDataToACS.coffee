path = require("path")
modulePath = path.resolve(__dirname, "lib/todayBeerBot.js")
todayBeerBot = require(modulePath).todayBeerBot
conf = require('config')
moment = require("moment")

bot = new todayBeerBot()
        
bot.parseFeedFromACS((items) ->
  for item in items
    getFeed = ((obj) ->
      console.log  "id  #{obj.id} name #{obj.name } feed #{obj.custom_fields.feed}"
      bot.parseFeed obj.custom_fields.feed,(items) ->

        if items.length isnt 0
          for item in items
            # クロージャー使わないと、ループが回りきった所でcheckIfFeedAlreadyPostOrNotに
            # 値が渡されてしまうためこのように処理する
            func = ((permalink,name,item,id)->
              bot.checkIfFeedAlreadyPostOrNot(permalink,(result) ->
                if result.length is 0
                  console.log "start #{permalink} and #{item.pubDate}"
                  # 取得済であることを意図するためにMongoDBにPermalinkの情報を追加する
                  currentTime = moment()
                  flg = bot._withinTheLimitsOfTheTime(item.pubDate,currentTime,120000)
                  # console.log "flg is #{flg} #{item.pubDate}, #{currentTime}"
                  
                  if flg is true
                    
                    bot.feedAlreadyPost(permalink,name,(docs) ->
                      console.log "feedAlreadyPost docs is #{docs}"
                      bot.postBlogEntry item,id, (result) ->
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
