twitter = require('ntwitter')
conf = require('config')
_ = require('underscore')

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

# user time line
# twit.verifyCredentials((err, data) ->
#   # console.log data
#   return
# ).getUserTimeline (err, data) ->
#   for tweet in data
#     if tweet.text isnt "undefined"
#       console.log tweet.text
#   return

# home time line
twit.verifyCredentials((err, data) ->
  # console.log data
  return
).getHomeTimeline (err, data) ->
  for tweet in data
    if tweet.text isnt "undefined"
      retweet(tweet)
      
# dictに含まれる情報のみをRTする
retweet = (targetTweet) ->
  dict = [
    'ペールエール',
    'IPA',
    'COECO'
    ]      
  segs = segmenter.segment(targetTweet.text)
  result = _.intersection(segs,dict)
  if result.length isnt 0
    console.log targetTweet.id_str
    twit.verifyCredentials((err, data) ->
      # console.log data

    ).retweetStatus targetTweet.id_str,(err, data) ->
      console.log data
    

