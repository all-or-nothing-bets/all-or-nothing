/* eslint-disable camelcase */
require('dotenv').config();
const Twit = require('twit');

const T = new Twit({
  consumer_key: process.env.API_KEY,
  consumer_secret: process.env.API_SECRET_KEY,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

// start stream and track tweets
// const stream = T.stream('statuses/filter', { track: 'wager' });

// use this to log errors from requests
function responseCallback(err, data, response) {
  console.log(err);
}

// event handler
// stream.on('tweet', tweet => {
//   const { created_at, text, user } = tweet;
//   console.log('\n\n------------------------------------------\n\n');
//   console.log(`${created_at} ${user.name} ${text}`);
// retweet
// T.post('statuses/retweet/:id', { id: tweet.id_str }, responseCallback);
// like
// T.post('favorites/create', { id: tweet.id_str }, responseCallback);
// });

T.post('statuses/update', { status: 'hello world!' }, function (err, data, response) {
  console.log(data);
});
