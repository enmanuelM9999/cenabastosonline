const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    res.render('index');
});

router.get('/enlaces', async (req, res) => {
    res.render('enlaces');
});

module.exports = router;