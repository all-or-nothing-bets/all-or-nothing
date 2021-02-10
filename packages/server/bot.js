/* eslint-disable camelcase */
require('dotenv').config();
const Twit = require('twit');

const bot = new Twit({
  consumer_key: process.env.API_KEY,
  consumer_secret: process.env.API_SECRET_KEY,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

// const stream = bot.stream('statuses/filter', { track: 'wager' });
const stream = bot.stream('statuses/filter', { track: '@michaelbcn' });

function tweetEvent(tweet) {
  console.log('tweetEvent triggered', tweet);

  const {
    id,
    text,
    user: { screen_name },
  } = tweet;
  const reply = `@${screen_name} check out https://miniguide.co`;

  console.log('id', id);
  console.log('tweetText', text);
  console.log('replyTo', screen_name);
  console.log('reply', reply);

  const callback = (err, data) => {
    if (err) console.log(err.mesage);
    else console.log(`Tweeted: ${data.text}`);
  };
  bot.post('statuses/update', { status: reply, in_reply_to_status_id: id }, callback);
}

const startBot = async () => {
  console.log('bot listening to stream');
  stream.on('tweet', tweetEvent);
};

const stopBot = async () => {
  console.log('bot stopped listening to stream');
  stream.stop();
};

// const stream = bot.stream('statuses/filter', { track: '@michaelbcn' });

// stream.on('tweet', tweetEvent);

// use this to log errors from requests
// function responseCallback(err, data, response) {
//   console.log(err);
// }

// event handler
// stream.on('tweet', tweet => {
//   const { created_at, text, user } = tweet;
//   console.log('\n\n------------------------------------------\n\n');
//   console.log(`${created_at} ${user.name} ${text}`);
// retweet
// bot.post('statuses/retweet/:id', { id: tweebot.id_str }, responseCallback);
// like
// bot.post('favorites/create', { id: tweebot.id_str }, responseCallback);
// });

// bot.post('statuses/update', { status: 'hello world!' }, function (err, data, response) {
//   console.log(data);
// });

module.exports = { startBot, stopBot };
