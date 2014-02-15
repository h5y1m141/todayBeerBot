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
      
exports.todayBeerBot = todayBeerBot
