const express = require('express');
const router = express.Router();
const db = require('../../resource/mysql/db'); // mysql module
const crypto = require('crypto'); // hash

// hash salt
const salt = process.env.SALT;

/* GET login page. */
router.get('/', function (req, res) {
    if (req.session.isLogined){
        return res.redirect('/mypage');
    }
    return res.render('login');
});
/* GET login page. */

/* POST login page. */
router.post('/', function (req, res) {
    let uid = req.body.id;
    let upw = req.body.pw;
    upw = crypto.createHash('sha512').update(upw + salt).digest('hex');

    console.log(uid, upw);

    db.query("select id from users where id=? and password=?;", [uid, upw], (error, result, fields) => {
        if (error) throw error;

        if (result[0] !== undefined) {
            req.session.uid = result[0].id;
            req.session.isLogined = true;
            // 세션 스토어가 이루어진 후 redirect를 해야함
            req.session.save(() => {
                console.log('로그인 성공!');
                return res.redirect('/mypage');
            });
        }
        else{
            console.log('로그인 실패..');
            return res.redirect('/login');
        }
    });
});
/* POST login page. */

module.exports = router;