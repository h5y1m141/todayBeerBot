class todayBeerBot
  constructor: () ->
    twitter = require('ntwitter')
    conf = require('config')
    @_ = require('underscore')    
    @moment = require('moment')
    @twit = new twitter(
      consumer_key        : conf.consumer_key
      consumer_secret     : conf.consumer_secret
      access_token_key    : conf.access_token_key
      access_token_secret : conf.access_token_secret
    )
    @feedList = conf.feedList

  getRSS:(callback) ->
    FeedParser = require('feedparser')
    request    = require('request')
    req        = request(@feedList[0].rss)

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
        # console.log item["atom:content"]
        # console.log item.title
        items.push item
        
    feedparser.on "end",() ->
      console.log "done parse items is #{items}"
      return callback items
    
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
      '限定ビール',    
      'ペールエール',
      'IPA',
      'エール',
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
    console.log " diffResult is #{diffResult}"
    if diffResult > 0 and diffResult < theLimitsOfTheTime  
      return true
    else
      return false

    
  _htmlToText:(rawHTML) ->
    return "12/21 (土) 本日のビール"
    
    
exports.todayBeerBot = todayBeerBot
