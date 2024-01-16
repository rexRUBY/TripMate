const express = require('express');
const router = express.Router();
const db = require('../../resource/mysql/db'); // mysql module

/* GET starting page. */
router.get('/', function (req, res) {
    return res.render('starting');
});
/* GET starting page. */

/* POST plan info load page. */
router.post('/load', function (req, res) {
    let uid = req.session.uid;

    db.query('select plan_name,location,date from plan where id=?;', [uid], (error, result, fields) => {
        let plan_info_array = [];

        if (error) throw error;
        for (i = 0; i < result.length; i++) {
            plan_info_array.push(result[i]);
        }
        return res.json({ plan_info_array: plan_info_array });
    });
});
/* POST plan info load page. */

/* POST save plan name in session page. */
router.post('/change_plan', function (req, res) {
    let plan_name = req.body.plan_name;

    req.session.now_plan = plan_name;
    req.session.save();

    return res.json({ result: true });
});
/* POST save plan name in session page. */

/* POST plan remove page. */
router.post('/remove', function (req, res) {
    let uid = req.session.uid;
    let plan_name_array = req.body.plan_name_array;

    for (i = 0; i < plan_name_array.length; i++) {
        db.query('delete from plan where id=? and plan_name=?;', [uid, plan_name_array[i]], (error, result, fields) => {
            if (error) throw error;
        });
    }

    // 중복 체크를 위한 여헁 계획 이름 배열 수정 (세션 값)
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

    return res.json({ result: true });
});
/* POST plan remove page. */

module.exports = router;