const express = require('express');
const router = express.Router();
const db = require('../../resource/mysql/db'); // mysql module

/* GET money page. */
router.get('/', function (req, res) {
    return res.render('money');
});
/* GET money page. */

/* POST money data load page. */
router.post('/load', function (req, res) {
    let uid = req.session.uid;
    let now_plan = req.session.now_plan;

    db.query('select money from plan where id=? and plan_name=?;', [uid, now_plan], (error, result, fields) => {
        if (error) throw error;

        let money_data = result[0].money;
        return res.json({ money_data: money_data });
    });
});
/* POST money data load page. */

/* POST money save page. */
router.post('/save', function (req, res) {
    let uid = req.session.uid;
    let now_plan = req.session.now_plan;
    let money_data = req.body;

    // money column update
    db.query('update plan set money=? where id=? and plan_name=?;', [JSON.stringify(money_data), uid, now_plan], (error, result, fields) => {
        if (error) throw error;
        return res.json({ is_saved: true });
    });

});
/* POST money save page. */

module.exports = router;