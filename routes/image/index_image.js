const express = require('express');
const router = express.Router();

/* GET image page. */
router.get('/', function (req, res) {
    return res.render('saveImage');
});
/* GET image page. */

module.exports = router;