const express = require('express');

const router = express.Router();

const { startBot, stopBot } = require('../bot');

router.get('/hello', (req, res) => {
  res.status(202).json({ code: 'hello' });
});

router.get('/start-bot', async (req, res) => {
  await startBot();
  res.status(202).json({ code: 'bot-started' });
});

router.get('/stop-bot', async (req, res) => {
  await stopBot();
  res.status(202).json({ code: 'bot-stopped' });
});

module.exports = router;
