const express = require('express'); // express
const nunjucks = require('nunjucks');
const logger = require('morgan'); // 로그 파일

const db = require('./resource/mysql/db'); // mysql module
const session = require('express-session'); // session
const MySQLStore = require('express-mysql-session')(session); // session store

// express 객체 선언
const app = express();
// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* session */
const sessionStore = new MySQLStore(db.config);

let maxAge = 180 * 60 * 1000; // 180분
app.use(session({
    key: 'SESSION_ID',
    secret: process.env.S_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        maxAge: maxAge,
    },
}));
/* session */

app.use(logger('dev')); // logger 사용
app.set('views', __dirname + '/views'); // view 경로 설정

// 화면 engine을 html로 설정
app.set('view engine', 'html');
// template engine: nunjucks
nunjucks.configure('views', {
    autoescape: true,
    express: app,
    watch: true,
});

// '/public' 디렉토리 설정(css, javascript 등의 파일 사용을 위해)
app.use('/public', express.static(__dirname + '/resource'));

// 경로 파일 분리(router 활용)
const router = require('./routes/index');
app.use(router)

/* listen port(3000) */
app.listen(3000);
