var express = require('express');
var router = express.Router();
var authorization = require('./route_handlers/authorization');
var rideHandle = require('./route_handlers/rideHandler');
var passport = require('passport');

const axios = require('axios');

router.all('/', (req, res) => {
    res.send('Hello');
});


router.post('/signup', (req, res) => {
    authorization.signup(req.body, res);

    // Make a request for a user with a given ID
    // axios.get('http://panel.smspm.com/gateway/80fef672638b44db90ef06a9b06a6abd534ee362/api.v1/send' ,{
    //     params: {
    //         sender: "Uberlo",
    //         phone: "201000922522",
    //         message: "Welcome to Uberlo. Happy riding.",
    //         output: "json"
    //       }
    // })
    // .then(function (response) {
    //     console.log(response.data);
    // });

});

router.get('/login', (req, res) => {
    authorization.login(req.body, res);
});

router.post('/requestride', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    rideHandle.requestRide(req, res);   
});


router.get('/getuserrides',(req, res, next) => {
    rideHandle.getuserrides(req.body, res);
});

router.get('/getavailablerides',(req, res, next) => {
    rideHandle.getavailablerides(req.body, res);
});



router.get('/getuser',(req, res, next) => {
    if (!req.body.id){
        res.status(500).json({
            error: "missing user id"
        })
    } else {
        res.status(200).json({
            user: authorization.getUser(req.body.id)
        })
    }
});

router.patch('/UserInformation',(req, res, next) => {
    const name = req.body.name;
    const phone = req.body.phone;
    if (!name || !phone) {
        res.status(500).json({
            message: "Missing Requirements"
        });
        return;
    }
    connection.query("UPDATE users SET name = '?', phone = '?' WHERE id = 1", function(err, rows) { //TODO: rider id
        if (err)
            res.status(500).json({
                message: err.message
            });
            if (rows.affectedRows){
                res.status(200).json({
                    message: 'update-submit-success'
                });   
            } else {
                res.status(500).json({
                    message: 'update-submit-failure'
                });
            } 
    });
});

router.patch('/ChangeDriverAvailability',(req, res, next) => {
    const isAvailable = req.body.isAvailable;
    if (!isAvailable) {
        res.status(500).json({
            message: "Missing Requirements"
        });
        return;
    }
    connection.query("UPDATE driver SET isAvailable = '?' WHERE id = 1",[isAvailable], function(err, rows) { //TODO: rider id
        if (err)
            res.status(500).json({
                message: err.message
            });
            if (rows.affectedRows){
                res.status(200).json({
                    message: 'update-submit-success'
                });   
            } else {
                res.status(500).json({
                    message: 'update-submit-failure'
                });
            } 
    });
});

router.patch('/AcceptRide',(req, res, next) => {
    const rideNo = req.body.rideNo;
    if (!rideNo) {
        res.status(500).json({
            message: "Missing Requirements"
        });
        return;
    }
    connection.query("UPDATE ride SET driver = 1 WHERE rideNo = ?",[rideNo], function(err, rows) { //TODO: rider id
        if (err)
            res.status(500).json({
                message: err.message
            });
            if (rows.affectedRows){
                res.status(200).json({
                    message: 'update-submit-success'
                });   
            } else {
                res.status(500).json({
                    message: 'update-submit-failure'
                });
            } 
    });
});

router.get('/Transactions',(req, res, next) => {
    connection.query("SELECT * FROM transaction WHERE fromUser = 1 OR toUser = 1", function(err, rows) { //TODO: rider id
        if (err)
            res.status(500).json({
                message: err.message
            });
        res.status(200).json({
            user: rows
        });
    });
});

router.patch('/ChangeDriver',(req, res, next) => {
    const username = req.body.username;
    const driver = req.body.driver;
    
    if (!username || !driver) {
        res.status(500).json({
            message: "Missing Requirements"
        });
        return;
    }
    connection.query("UPDATE users SET isDriver = ? WHERE username = ?",[driver, username], function(err, rows) { //TODO: rider id
        if (err)
            res.status(500).json({
                message: err.message
            });
            if (rows.affectedRows){
                res.status(200).json({
                    message: 'update-submit-success'
                });   
            } else {
                res.status(500).json({
                    message: 'update-submit-failure'
                });
            } 
    });
});







module.exports = router;
