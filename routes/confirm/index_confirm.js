const express = require('express');
const router = express.Router();

/* GET confirm page. */
router.get('/', function (req, res) {
    return res.render('confirm');
});
/* GET confirm page. */

module.exports = router;