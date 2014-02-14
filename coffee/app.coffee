twitter = require('ntwitter')
conf = require('config')
_ = require('underscore')
moment = require('moment')
# 形態素解析のために外部ライブラリ読み込む
path = require("path")
modulePath = path.resolve(__dirname, "lib/tiny_segmenter-0.2.js")
TinySegmenter = require(modulePath).TinySegmenter

segmenter = new TinySegmenter()

twit = new twitter(
  consumer_key        : conf.consumer_key
  consumer_secret     : conf.consumer_secret
  access_token_key    : conf.access_token_key
  access_token_secret : conf.access_token_secret
)

# home time line
params =
  count:200
twit.verifyCredentials((err, data) ->
  # console.log data
  return
).getHomeTimeline params, (err, data) ->
  for tweet in data
    if tweet.text isnt "undefined"
      # console.log tweet.id_str + moment(tweet.created_at).fromNow()
      # console.log moment(tweet.created_at).format("YYYY-MM-DD HH:mm Z")

      retweet(tweet)
      
# dictに含まれる情報のみをRTする
retweet = (targetTweet) ->
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
  segs = segmenter.segment(targetTweet.text)
  result = _.intersection(segs,dict)
  
  tweetTime = moment(targetTweet.created_at)
  currentTime = moment()
  diffResult = currentTime.diff(tweetTime)/1000
  # console.log "#{targetTweet.user.name}  #{targetTweet.id_str}:  #{currentTime.diff(tweetTime)/1000}"

  # １時間＝3600秒なので
  #  diffの値がその値よりも小さい場合にのみRetweetする
  
  if result.length isnt 0 and diffResult < 3600
    console.log targetTweet.user.name + targetTweet.id_str
    twit.verifyCredentials((err, data) ->
      # console.log data

    ).retweetStatus targetTweet.id_str,(err, data) ->
      console.log data
    

