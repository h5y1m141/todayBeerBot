twitter = require('ntwitter')
conf = require('config')
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
      console.log "name:#{tweet.user.name} tweet:#{tweet.text}"
  return
