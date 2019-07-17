const mysql = require('mysql');

var connection = mysql.createConnection({
    host:'remotemysql.com',
    port: '3306',
    user:'vPV1Sv1oWT',
    password:'e97f3JgHjg',
    database: 'vPV1Sv1oWT',
    multipleStatements: true
});

connection.connect(err => {
    if(err){
        console.log(err.message);
    } else {
        console.log("Connected to database successfully...")
    }
});

module.exports = connection