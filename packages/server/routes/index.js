const express = require('express');

const router = express.Router();

router.get('/hello', (req, res) => {
  res.status(202).json({ code: 'hello' });
});

module.exports = router;
