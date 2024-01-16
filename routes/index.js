const express = require('express');
const router = express.Router();
const signup = require('./signup/index_signup');     // signup router
const login = require('./login/index_login');       // login router
const plan = require('./plan/index_plan');         // plan router
const confirm = require('./confirm/index_confirm');   // confirm router
const starting = require('./starting/index_starting'); // starting router
const image = require('./image/index_image');   // image router
const view = require('./view/index_view');         // view router
const edit = require('./edit/index_edit');         // edit router
const money = require('./money/index_money');       // money router
const mypage = require('./mypage/index_mypage');     // mypage router
const logout = require('./logout/index_logout');     // logout router

const logincheck = function loginCheck(req, res, next) {
    try {
        if (req.session.isLogined !== true) {
            return res.redirect('/login');
        }
    } catch (error) {
        console.log(error);
        return res.redirect('/login');
    }

    next();
}

/* GET index page. */
router.get('/', function (req, res) {
    if (req.session.isLogined === true)
        return res.redirect('/mypage');
    else
        return res.render('index');
});
/* GET index page. */

// signup path
router.use('/signup', signup);

// login path
router.use('/login', login);

// mypage path
router.use('/mypage', logincheck, mypage);

// plan path
router.use('/plan', logincheck, plan);

// confirm path
router.use('/confirm', logincheck, confirm);

// starting path
router.use('/starting', logincheck, starting);

// image path
router.use('/image', logincheck, image);

// view path
router.use('/view', logincheck, view);

// edit path
router.use('/edit', logincheck, edit);

// money path
router.use('/money', logincheck, money);

// logout path
router.use('/logout', logincheck, logout);

module.exports = router;