const express = require('express');
const router = express.Router();
const db = require('../../resource/mysql/db'); // mysql module

/* GET edit page. */
router.get('/', function (req, res) {
    return res.render('editplan');
});
/* GET eidt page. */

/* POST plan name duplication check page. */
router.post('/check', function (req, res) {
    // mypage에서 생성했던 plan_name 배열을 세션에 저장
    let name_array = req.session.plan_name_array;
    let now_plan = req.session.now_plan;
    let plan_name = req.body.plan_name;

    // 현재 수정하고 있는 계획의 이름이 아니면서 중복될 경우 입력 안됨
    if (name_array.includes(plan_name) && plan_name != now_plan) {
        return res.json({ duplication: true, plan_name: now_plan });
    } else {
        return res.json({ duplication: false });
    }
});
/* POST plan name duplication check page. */

/* POST plan edit page. */
router.post('/save', function (req, res) {
    let uid = req.session.uid;

    let data = req.body.plan_data;
    let plan_name = data[0].plan_name;
    let plan_location = data[1].plan_location;
    let plan_date = data[2].plan_date;
    let plan_people = data[3].plan_people;
    let plan_data_array = data.slice(4);
    let now_plan = req.session.now_plan;

    // 여행 계획 수정
    db.query('update plan set plan_name=?, location=?, date=?, people=?, data=? where id=? and plan_name=?;', [plan_name, plan_location, plan_date, plan_people, JSON.stringify({ plan_data_array: plan_data_array }), uid, now_plan], (error, result, fields) => {
        if (error) throw error;
        return res.json({ edit: true });
    });
});
/* POST plan edit page. */

module.exports = router;