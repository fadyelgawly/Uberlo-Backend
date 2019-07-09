var express = require('express');
var router = express.Router();
var authorization = require('./route_handlers/authorization');
var rideHandle = require('./route_handlers/rideHandler');
var passport = require('passport');
var user = require('./route_handlers/users');
var db = require('./database')

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



router.get('/user',(req, res, next) => {
    // if (!req.user.id){
    //     res.status(500).json({
    //         error: "missing user id"
    //     })
    // } else {
        console.log("/user");
        let id = 9;
        var user = {};
        const usernames = `SELECT * FROM users WHERE id = "${id}"`;
        console.log(usernames);
        db.query(usernames, (error, rows) => {
            console.log("quered");
            if (error || !rows) 
                res.status(500).json({
                    error: "error"
                });
            if (rows)
                res.status(200).json({
                   user: rows[0]
                });
        });
  //  }
});

router.patch('/user',(req, res, next) => {
    user.patchUser(req, res);
});

router.patch('/admin/user',(req, res, next) => {
    user.patchUserAsAdmin(req, res);
});

router.patch('/driver/changestatus',(req, res, next) => {
    const id = req.user.id;
    const isAvailable = req.body.isAvailable;
    if (!isAvailable) {
        res.status(500).json({
            message: "Missing Requirements"
        });
        return;
    }
    db.query("UPDATE driver SET isAvailable = '?' WHERE id = ?",[isAvailable, id], function(err, rows) { //TODO: rider id
        if (err)
            res.status(500).json({
                message: err.message
            });
            if (rows.affectedRows){
                res.status(200).json({
                    message: 'success'
                });   
            } else {
                res.status(500).json({
                    message: 'failure'
                });
            } 
    });
});

router.patch('/driver/changelocation',(req, res, next) => {
    const id = req.user.id;
    const currentArea = req.body.currentArea;
    if (!currentArea) {
        res.status(500).json({
            message: "Missing Requirements"
        });
        return;
    }
    db.query("UPDATE driver SET currentArea = '?' WHERE id = ?",[isAvailable, id], function(err, rows) { //TODO: rider id
        if (err)
            res.status(500).json({
                message: err.message
            });
            if (rows.affectedRows){
                res.status(200).json({
                    message: 'success'
                });   
            } else {
                res.status(500).json({
                    message: 'failure'
                });
            } 
    });
});

router.patch('/driver/acceptRide',(req, res, next) => {
    const driverid = req.user.id
    const rideNo = req.body.rideNo;
    if (!rideNo) {
        res.status(500).json({
            message: "Missing Requirements"
        });
        return;
    }
    db.query("UPDATE ride SET driver = ?, rideStatus = A WHERE rideNo = ?", 
    [driverid ,rideNo],
    function(err, rows) { 
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


router.patch('/driver/endtrip',(req, res, next) => {
    const driverid = req.user.id
    const rideNo = req.body.rideNo;
    if (!rideNo) {
        res.status(500).json({
            message: "Missing Requirements"
        });
        return;
    }
    db.query("UPDATE ride SET rideStatus = A WHERE rideNo = ?",[rideNo], function(err, rows) { //TODO: rider id
        if (err){
            res.status(500).json({
                message: err.message
            });
            return;
        }
        if (rows.affectedRows){
            db.query("SELECT rider FROM ride WHERE rideNo = ?", [rideNo] ,function(err, rows){
                if (err || !rows){
                    res.status(500).json({
                        message: 'update-submit-failure'
                    });
                    return;
                } else {
                    db.query("INSERT INTO transaction (toUser ,fromUser, 143) values (?,?)", [driverid, rows[0].rider], function(err, rows){
                        if (err){
                            res.status(200).json({
                                message: 'update-submit-success'
                            }); 
                            return;
                        }
                    });
                }
            }); 
        } else {
            res.status(500).json({
                message: 'update-submit-failure'
            });
        } 
    });
});

router.patch('/driver/cancelTrip',(req, res, next) => {
    const driverid = req.user.id
    const rideNo = req.body.rideNo;
    if (!rideNo) {
        res.status(500).json({
            message: "Missing Requirements"
        });
        return;
    }
    db.query("UPDATE ride SET rideStatus = A WHERE rideNo = ?",[rideNo], function(err, rows) { //TODO: rider id
        if (err){
            res.status(500).json({
                message: err.message
            });
            return;
        }
        if (rows.affectedRows){
            db.query("SELECT rider FROM ride WHERE rideNo = ?", [rideNo] ,function(err, rows){
                if (err || !rows){
                    res.status(500).json({
                        message: 'update-submit-failure'
                    });
                    return;
                } else {
                    db.query("INSERT INTO transaction (fromUser ,toUser, 10) values (?,?)", [driverid, rows[0].rider], function(err, rows){
                        if (err){
                            res.status(200).json({
                                message: 'update-submit-success'
                            }); 
                            return;
                        }
                    });
                }
            }); 
        } else {
            res.status(500).json({
                message: 'update-submit-failure'
            });
        } 
    });
});


router.post('/admin/transaction',(req, res, next) => {

    const isAdmin = req.user.isAdmin;
    const toUser = req.body.toUser;
    const amount = req.body.amount;

    if (!isAdmin) {
        res.status(500).json({
            error: "not authorized to add credit"
        });
        return;
    }

    const insertQuery = `INSERT INTO transaction (toUser, amount) values (?,?)`;
    db.query(insertQuery, [toUser, amount], (error, rows) => {
        if (error) {
            res.status(500).json({
                error: error
            }); 
        } else {
            res.status(200).json({
                rows: rows
            }); 

        }
    });
});

module.exports = router;
