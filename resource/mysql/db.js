const mysql = require('mysql'); // DB 연동

// DB 접속 정보 (환경 변수에 저장)
const option = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
}

const connection = mysql.createConnection(option);

module.exports = connection;