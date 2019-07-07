var express = require('express');
var router = express.Router();
var authorization = require('./route_handlers/authorization');
var database = require('./database');

router.all('/', (req, res) => {
    res.send('Hello');
});


router.post('/signup', (req, res) => {
    authorization.signup(req.body, res);
});

router.get('/login', (req, res) => {
    authorization.login(req.body, res);
});



module.exports = router;

// "username": "username",
// "password": "password",
// "firstname": "firstname",
// "lastname": "lastname",
// "phone": "phone",
// "isDriver": true