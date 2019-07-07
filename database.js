const mysql = require('mysql');

var connection = mysql.createConnection({
    host:'sql9.freemysqlhosting.net',
    port: '3306',
    user:'sql9297774',
    password:'87Al8Fk7im',
    database: 'sql9297774'
});

connection.connect(err => {
    if(err){
        console.log(err.message);
    } else {
        console.log("Connected to database successfully...")
    }
});

module.exports = connection