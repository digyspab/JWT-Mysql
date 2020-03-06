const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.send('App is running')
});

module.exports = router;