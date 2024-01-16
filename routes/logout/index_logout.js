const express = require('express');
const router = express.Router();
const db = require('../../resource/mysql/db'); // mysql module

/* GET logout page. */
router.get('/', function (req, res) {
    req.session.destroy(function () {
        console.log("로그아웃!");
        req.session;

        // 만료된 세션 삭제
        db.query('delete from sessions where(select substr(data,47,23)<now());', (error, result, fields) => {
            if (error) throw error;
        });

        // index page로 복귀
        return res.redirect('/');
    });
});
/* GET logout page. */

module.exports = router;