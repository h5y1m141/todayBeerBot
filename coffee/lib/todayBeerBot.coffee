class todayBeerBot
  constructor: () ->
    twitter = require('ntwitter')
    conf = require('config')
    Bitly = require("bitly")
    @bitly = new Bitly("h5y1m141", conf.bitly)
    @ACS = require('acs-node')
    @loginID = conf.acs.user.id
    @loginPasswd = conf.acs.user.password
    @ACS.init(conf.acs.production)    
    @uri = "mongodb://#{conf.mongodb.db}:#{conf.mongodb.password}@ds033639.mongolab.com:33639/craftbeerfan"    
    @_ = require('underscore')    
    @moment = require('moment')
    @twit = new twitter(
      consumer_key        : conf.consumer_key
      consumer_secret     : conf.consumer_secret
      access_token_key    : conf.access_token_key
      access_token_secret : conf.access_token_secret
    )

    mongo = require('mongodb')

    mongo.connect @uri, {}, (error, db) =>
      console.log "error is #{error}" if error
      @connection = db.collection("shop")    

  parseFeed:(feed,callback) ->
    FeedParser = require('feedparser')
    request    = require('request')
    options =
      url:feed
      headers:{
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.95 Safari/537.11'}
    req  = request(options)
    that = @
    feedparser = new FeedParser()
    items = []     
    req.on "error", (error) ->
      # handle any request errors

    req.on "response", (res) ->
      stream = this
      return @emit("error", new Error("Bad status code"))  unless res.statusCode is 200
      stream.pipe feedparser
      return

    feedparser.on "error", (error) ->
      # always handle errors

    feedparser.on "readable",() ->
      # This is where the action is!
      stream = this
      meta = @meta
      while item = stream.read()
        # クラフトビールの開栓情報らしきものが含まれてるエントリだけ抽出する
        # console.log item["atom:content"]["#"]
        # text = that._htmlToText(item["atom:content"]["#"])
        # pubDate = that.moment(item.pubDate).format("YYYY-MM-DD")
        if that._checkIfFeed(item) is true
          # console.log item.title
          items.push item
        
    feedparser.on "end",() ->
      # console.log "done parse items is #{items}"
      return callback items
      
  parseFeedFromACS:(callback) ->

    @ACS.Places.query
      page: 1
      per_page: 500
      where:
        feed:{"$ne":"null"}

    ,(e) ->
      if e.success
        callback e.places

          
  postBlogEntry:(item,placeID,callback)->
    feedType = item.meta["#type"]
    that = @
    
    if feedType is 'atom'
      text = @_htmlToText(item["atom:content"]["#"])
    else
      text = @_htmlToText(item["rss:description"]["#"])
    base_url = item.link  
    @bitly.shorten base_url, (err, response) ->
      if err
        # bitlyで短縮されたURLが取得できてないので、その場合にはブログの本文抽出あきらめる
        postData = "更新日#{that.moment(item.pubDate).format("MM-DD")}の「#{item.meta.title}」の情報。くわしくはWebを→ " + base_url
      else
        short_url = response.data.url
        postData = "更新日#{that.moment(item.pubDate).format("MM-DD")}の「#{item.meta.title}」の情報： #{text}".substring(0, 110) + short_url
      # console.log "#{postData} #{short_url}"

      # ACSのStatusesオブジェクトに該当情報をPostする
      that.postBeerInfoToACS placeID,postData,(result) ->
        console.log "postBeerInfoToACS success flg is #{result.success}"
        # 上記で生成したtpostDataをTweetする
        that.tweet postData ,(data) ->
          console.log "postData is done data is #{data}"
          return callback data
        
  checkIfFeedAlreadyPostOrNot:(targetFeedURL,callback) ->
    @ACS.Objects.query
      classname:"onTapInfo"
      page: 1
      per_page:20
      where:
        permalink:targetFeedURL
    , (e) ->

      if e.success
        callback e.onTapInfo
      else
        callback []

            
  feedAlreadyPost:(permalink,name,callback) ->
    mongo = require('mongodb')
    mongo.connect @uri, {}, (error, db) ->
      console.log "feedAlreadyPost error  error is #{error}" if error
      param = 
        permalink : permalink
        name      : name
      setTimeout (->
        db.collection("shop").insert (param), (err,docs) ->
          console.log "feedAlreadyPost err #{err}" if err
          db.close()
          console.log docs
          callback docs
      ), 1000
           
  _checkIfFeed:(item) ->
    currentTime = @moment()
    feedType = item.meta["#type"]
    if feedType is 'atom'
      text = @_htmlToText(item["atom:content"]["#"])
    else if feedType is 'rss'
      text = @_htmlToText(item["rss:description"]["#"])
    else
      console.log 'feed type is undefined'
      text = 'feed type is undefined'

    pubDate = @moment(item.pubDate)
    # console.log @_withinTheLimitsOfTheTime(pubDate, currentTime)
    # 本来なら@_withinTheLimitsOfTheTime(pubDate, currentTime)実施して
    # エントリの更新日が該当時間ないかチェックするべきだが、ブログは更新頻度が少ないため
    # ひとまずこのメソッド内ではクラフトビール関連のキーワードがあるかどうかだけチェックする
    if @_hasCraftBeerKeyword(text) is true
      return true
    else
      return false
      
  getTweet:(callback) ->
    tweets = []
    params =
      count:100
    @twit.verifyCredentials((err, data) ->
      # console.log data
    ).getHomeTimeline params, (err, data) ->
      return callback(err) if err
      
      for tweet in data
        if tweet.text isnt "undefined"
          tweets.push tweet
          
      return callback tweets
      
  retweet:(id_str,callback) ->
    @twit.verifyCredentials((err, data) ->
      # console.log data

    ).retweetStatus id_str,(err, data) ->
      console.log "err is #{err} and data is #{data}"        
      if err
        callback err
      else
        callback data
  tweet:(postData,callback) ->
    # fakseResult =
    #   name:'dummy'
    # return callback fakseResult      
    @twit.verifyCredentials((err, data) ->
      # console.log data
      
    ).updateStatus postData,(err, data) ->
      console.log "err is #{err} and data is #{data}"        
      if err
        callback err
      else
        callback data
      

  postBeerInfoToACS:(placeID,message,callback) ->
    data =
      login: @loginID
      password: @loginPasswd
    currentTime = @moment()
    that = @
    @ACS.Users.login(data, (response) =>
      if response.success
        @ACS.Statuses.create
          place_id:placeID
          session_id:response.meta.session_id
          message:message
        , (result) ->
          # console.log result
          # callback result 
          
          # Statusesの登録完了したら、該当の店舗の custom_fields statusesUpdateを更新する
          
          that.ACS.Places.update
            place_id:placeID
            session_id:response.meta.session_id
            custom_fields:
              statusesUpdate:currentTime
          ,(e) ->
            console.log e
            callback e
    )
    
  _checkIfTweet:(targetTweet) ->
    id_str = targetTweet.id_str    
    tweetTime = @moment(targetTweet.created_at)
    currentTime = @moment()
    
    if @_hasCraftBeerKeyword(targetTweet.text) is true and @_withinTheLimitsOfTheTime(tweetTime, currentTime) is true
      return true
    else
      return false
          
  # 引数にとるキーワードの中に開栓情報らしきものが含まれてるかどうか
  # 判定するメソッド          
  _hasCraftBeerKeyword:(contents) ->
    flg = null
    dict = [
      '本日',
      '開栓',
      '開栓情報',
      '樽生',      
      '限定ビール',    
      'ペールエール',
      'IPA',
      'エール',
      'Ale',
      'Today',
      'taps',
      'Pale Ale',
      '箕面ビール',
      '箕面',
      'COECO',
      '湘南ビール',
      '伊勢角屋麦酒'    
      ]
    path = require("path")
    modulePath = path.resolve(__dirname, "tiny_segmenter-0.2.js")
    TinySegmenter = require(modulePath).TinySegmenter
    segmenter = new TinySegmenter()
    
    segs = segmenter.segment(contents)
    result = @_.intersection(segs,dict)
    if result.length isnt 0
      flg = true
    else
      flg = false
    return flg
    
  # 指定時間内かどうかを判定するメソッド
  # １時間＝3600秒で、その範囲内にある場合に処理を行いたい
  # ため基準となる数値を以下で設定

  _withinTheLimitsOfTheTime:(target,flgTime,theLimitsOfTheTime = 3600) ->
    timeA = @moment(target)
    diffResult = @moment(flgTime).diff(timeA)/1000
    # console.log " diffResult is #{diffResult} and theLimitsOfTheTime  is #{theLimitsOfTheTime }"
    if diffResult > 0 and diffResult < theLimitsOfTheTime  
      return true
    else
      return false

    
  _htmlToText:(rawHTML) ->
    htmlToText = require('html-to-text')
    text = htmlToText.fromString(rawHTML,{wordwrap: 0})
    # console.log "text is #{text.replace(/[\n\r]/g,"")}"
    return text.replace(/[\n\r]/g,"")
    
  _login:(callback) ->
    data =
      login: @loginID
      password: @loginPasswd
    
    @ACS.Users.login(data, (response) =>
      
      if response.success
        # @loggerRequest.info(response.meta.session_id)
        callback(response.meta.session_id)
      else
        @loggerRequest.info "Error to login: " + response.message
    )            
  _getPlaceIDFromACS:(twitterScreenName,callback) ->
    @ACS.Places.query
      page: 1
      per_page: 1
      where:
        twitter:twitterScreenName
    ,(result) ->
      callback result
      # if e.success
      #   callback e.places[0]
exports.todayBeerBot = todayBeerBot
