const express = require('express');
const router = express.Router();
const db = require('../../resource/mysql/db'); // mysql module

/* GET mypage page. */
router.get('/', function (req, res) {
    uid = req.session.uid;

    db.query('select plan_name from plan where id=?;', [uid], (error, result, fields) => {
        if (error) throw error;

        if (result[0] !== undefined) {
            let name_array = [];
            for (i = 0; i < result.length; i++) {
                name_array.push(result[i].plan_name);
            }
            req.session.plan_name_array = name_array;
            req.session.save();
        } else {
            req.session.plan_name_array = undefined;
            req.session.save();
        }

    });

    return res.render('my_page');
});
/* GET mypage page. */

module.exports = router;