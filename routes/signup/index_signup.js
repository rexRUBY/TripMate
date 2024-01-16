const express = require('express');
const router = express.Router();
const db = require('../../resource/mysql/db'); // mysql module
const crypto = require('crypto'); // hash

// salt는 환경변수에 저장하는 것이 좋을 것 같다
// const salt = crypto.randomBytes(128).toString('base64');
const salt = process.env.SALT;


/* GET signup page. */
router.get('/', function (req, res) {
    return res.render('signup');
});
/* GET signup page. */

/* POST signup page. */
router.post('/', function (req, res) {
    let uid = req.body.id;
    let upw = req.body.pw;
    let reupw = req.body.repw;

    if (upw !== reupw)
        return res.redirect('/signup');

    upw = crypto.createHash('sha512').update(upw + salt).digest('hex');
    db.query("insert into users values(?,?);", [uid, upw], (error, rows, fields) => {
        if (error) throw error;
        console.log(rows);
    });

    return res.redirect('/login');
});
/* POST signup page. */

module.exports = router;
