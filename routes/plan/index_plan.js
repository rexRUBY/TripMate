const express = require('express');
const router = express.Router();
const db = require('../../resource/mysql/db'); // mysql module

/* GET plan page. */
router.get('/', function (req, res) {
    return res.render('planning');
});
/* GET plan page. */

/* POST plan name duplication check page. */
router.post('/check', function (req, res) {
    // 계획이 없으면 체크 안 함
    if (req.session.plan_name_array === undefined)
        return res.json({ duplication: false });

    // mypage에서 생성했던 plan_name 배열을 세션에 저장
    let name_array = req.session.plan_name_array;
    let plan_now = req.session.plan_now;
    let plan_name = req.body.plan_name;
    
    if (name_array.includes(plan_name) && plan_name != plan_now) {
        return res.json({ duplication: true });
    } else {
        return res.json({ duplication: false });
    }
});
/* POST plan name duplication check page. */

/* POST plan save page. */
router.post('/save', function (req, res) {
    let uid = req.session.uid;

    let data = req.body.plan_data;
    let plan_name = data[0].plan_name;
    let plan_location = data[1].plan_location;
    let plan_date = data[2].plan_date;
    let plan_people = data[3].plan_people;
    let plan_data_array = data.slice(4);

    let name_array = req.session.plan_name_array;

    // 계획 이름을 세션에 저장
    req.session.now_plan = plan_name;
    req.session.save();

    if (name_array === undefined) {
        db.query('insert into plan(id,date,people,plan_name,data,location) values(?,?,?,?,?,?);', [uid, plan_date, plan_people, plan_name, JSON.stringify({ plan_data_array: plan_data_array }), plan_location], (error, result, fields) => {
            if (error) throw error;
            return res.json({ is_saved: true });
        });
    } else {
        if (name_array.includes(plan_name)) {
            // 뒤로 가기로 수정할 경우 update 쿼리 적용
            db.query('update plan set date=?, people=?, data=?, location=? where id=? and plan_name=?;', [plan_date, plan_people, JSON.stringify({ plan_data_array: plan_data_array }), plan_location, uid, plan_name], (error, result, fields) => {
                if (error) throw error;
                return res.json({ is_saved: true });
            });
        } else {
            db.query('insert into plan(id,date,people,plan_name,data,location) values(?,?,?,?,?,?);', [uid, plan_date, plan_people, plan_name, JSON.stringify({ plan_data_array: plan_data_array }), plan_location], (error, result, fields) => {
                if (error) throw error;
                return res.json({ is_saved: true });
            });
        }
    }
});
/* POST plan save page. */

module.exports = router;