const express = require('express');
const router = express.Router();
const db = require('../../resource/mysql/db'); // mysql module

/* GET plan view page. */
router.get('/', function (req, res) {
    return res.render('viewplan');
});
/* GET plan view page. */

/* POST plan data load page. */
router.post('/load', function (req, res) {
    let uid = req.session.uid;
    let plan_name = req.session.now_plan;

    db.query('select plan_name,location,date,people,data from plan where id=? and plan_name=?;', [uid, plan_name], (error, result, fields) => {
        if (error) throw error;
        return res.json({ data_array: result[0] });
    });
});
/* POST plan data load page. */


module.exports = router;