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

router.post('/login', (req, res) => {
    authorization.login(req.body, res);
});

router.post('/requestride', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    rideHandle.requestRide(req, res);
});


router.get('/getuserrides', (req, res, next) => {
    rideHandle.getuserrides(req.body, res);
});

router.get('/getrequestedride', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const id = req.user.id;
    db.query('SELECT * FROM ride WHERE rider = ? AND rideStatus != ? AND rideStatus != ?', [id, 'D', 'C'], (err,rows) => {
        if (err){
            res.status(500).json({
                error: err.message
            });
        } else {
            res.status(200).json({
                ride: rows[0]
            });
        }
    });
});

router.get('/getavailablerides', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (req.user.isDriver) {
        db.query("SELECT * FROM driver WHERE id = ?", [req.user.id], function (err, rows) {
            if (err) {
                res.status(401).json({
                    error: err.message
                });
            } else if (!rows) {
                res.status(500).json({
                    error: "driver didn't set his availability state nor location"
                });
            } else if (rows) {
                const location = rows[0].currentArea;
                db.query("SELECT * FROM rides WHERE fromArea = ?", [location], function (err, rows) {
                    if (error) {
                        res.status(500).json({
                            error: err.message
                        });
                    } else {
                        res.status(200).json({
                            rides: rows
                        });
                    }
                });
                res.status(401).json({
                    rides: "driver didn't set his availability state nor currentLocation"
                });
            }
        });

    } else {
        res.status(401).json({
            error: "not authorised, only drivers are authorised"
        });
    }
});



router.get('/user', passport.authenticate('jwt', { session: false }), (req, res, next) => {

    if (!req.user.id) {
        res.status(500).json({
            error: "missing user id"
        })
    } else {
        let id = 9;
        const usernames = `SELECT * FROM users WHERE id = "${req.user.id}"`;
        db.query(usernames, (error, rows) => {
            if (error || !rows)
                res.status(500).json({
                    error: "error"
                });
            if (rows)
                res.status(200).json({
                    user: rows[0]
                });
        });
    }
});

router.patch('/user', (req, res, next) => {
    user.patchUser(req, res);
});

router.patch('/admin/user', (req, res, next) => {
    user.patchUserAsAdmin(req, res);
});

router.get('/admin/rides', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (req.user.isAdmin) {
        db.query("SELECT * FROM ride", function (error, rows) {
            if (error) {
                res.status(500).json({
                    error: error
                });
            } else {
                res.status(200).json({
                    users: rows
                });
            }
        });


    } else {
        res.status(400).json({
            error: "not authorized, only admins are authorized"
        })
    }

});


router.get('/admin/users', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (req.user.isAdmin) {
        db.query("SELECT * FROM users", function (error, rows) {
            if (error) {
                res.status(500).json({
                    error: "Couldn't reach database"
                });
            } else {
                res.status(200).json({
                    users: rows
                });
            }
        });
    } else {
        res.status(400).json({
            error: "not authorized, only admins are authorized"
        })
    }
});



router.patch('/driver/changestatus', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (!req.body.isAvailable) {
        res.status(500).json({
            error: "isAvailable is missing"
        });
    } else if (!req.user.isDriver) {
        res.status(401).json({
            error: "user is not a driver"
        });
    } else {
        db.query("SELECT * FROM driver WHERE id = ?", [req.user.id], function (err, rows) {
            if (err) {
                res.status(500).json({
                    message: err.message
                });
            } else if (rows[0]) {
                db.query("UPDATE driver SET isAvailable = ? WHERE id = ?", [req.body.isAvailable, req.user.id], function (err, rows) {
                    if (err) {
                        res.status(500).json({
                            message: err.message
                        });
                    } else if (rows.affectedRows) {
                        res.status(200).json({
                            message: "update-successful"
                        });
                    } else {
                        res.status(500).json({
                            message: "I don't think you should come here"
                        });
                    }
                });
            } else if (!rows) {
                db.query("INSERT INTO driver (id , isAvailable) values (?,?)", [req.user.id, req.body.isAvailable], function (err, rows) {
                    if (err) {
                        res.status(500).json({
                            status: 'update-submit-failure'
                        });

                    } else if (rows.affectedRows) {
                        res.status(200).json({
                            status: 'update-submit-success',
                            message: 'Please set your current location before you can take requests'
                        });
                    }
                });
            }
        });
    }
});


router.patch('/driver/changeLocation', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (!req.body.currentArea) {
        res.status(500).json({
            error: "currentArea is missing"
        });
    } else if (!req.user.isDriver) {
        res.status(401).json({
            error: "user is not a driver"
        });
    } else {
        db.query("SELECT * FROM driver WHERE id = ?", [req.user.id], function (err, rows) {
            if (err) {
                res.status(500).json({
                    message: err.message
                });
            } else if (rows) {
                db.query("UPDATE driver SET currentArea = '?' WHERE id = ?", [req.body.currentArea, req.user.id], function (err, rows) {
                    if (err) {
                        res.status(500).json({
                            message: err.message
                        });
                    } else if (rows.affectedRows) {
                        res.status(200).json({
                            message: "update-successful"
                        });
                    } else {
                        res.status(500).json({
                            message: "I don't know what's happening here or how did you reach here put tell me if you do"
                        });
                    }
                });
            } else if (!rows) {
                db.query("INSERT INTO driver (id , currentArea) values (?,?)", [req.user.id, req.body.currentArea], function (err, rows) {
                    if (err) {
                        res.status(500).json({
                            status: 'update-submit-failure'
                        });

                    } else if (rows.affectedRows) {
                        res.status(200).json({
                            status: 'update-submit-success',
                            message: 'Please set your availability before you can take requests'
                        });
                    }
                });
            }
        });
    }
});

router.patch('/driver/acceptRide', (req, res, next) => {
    const driverid = req.user.id
    const rideNo = req.body.rideNo;
    if (!rideNo) {
        res.status(500).json({
            message: "Missing Requirements"
        });
        return;
    }
    db.query("UPDATE ride SET driver = ?, rideStatus = A WHERE rideNo = ?",
        [driverid, rideNo],
        function (err, rows) {
            if (err)
                res.status(500).json({
                    message: err.message
                });
            if (rows.affectedRows) {
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


router.patch('/driver/endtrip', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const driverid = req.user.id
    const rideNo = req.body.rideNo;
    if (!rideNo) {
        res.status(500).json({
            message: "Missing Requirements"
        });
        return;
    }
    db.query("UPDATE ride SET rideStatus = A WHERE rideNo = ?", [rideNo], function (err, rows) { //TODO: rider id
        if (err) {
            res.status(500).json({
                message: err.message
            });
            return;
        }
        if (rows.affectedRows) {
            db.query("SELECT rider FROM ride WHERE rideNo = ?", [rideNo], function (err, rows) {
                if (err || !rows) {
                    res.status(500).json({
                        message: 'update-submit-failure'
                    });
                    return;
                } else {
                    db.query("INSERT INTO transaction (toUser ,fromUser, 143) values (?,?)", [driverid, rows[0].rider], function (err, rows) {
                        if (err) {
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

router.patch('/driver/cancelTrip', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const driverid = req.user.id
    const rideNo = req.body.rideNo;
    if (!rideNo) {
        res.status(500).json({
            message: "Missing Requirements"
        });
        return;
    }
    db.query("UPDATE ride SET rideStatus = A WHERE rideNo = ?", [rideNo], function (err, rows) { //TODO: rider id
        if (err) {
            res.status(500).json({
                message: err.message
            });
            return;
        }
        if (rows.affectedRows) {
            db.query("SELECT rider FROM ride WHERE rideNo = ?", [rideNo], function (err, rows) {
                if (err || !rows) {
                    res.status(500).json({
                        message: 'update-submit-failure'
                    });
                    return;
                } else {
                    db.query("INSERT INTO transaction (fromUser ,toUser, 10) values (?,?)", [driverid, rows[0].rider], function (err, rows) {
                        if (err) {
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


router.post('/admin/transaction', passport.authenticate('jwt', { session: false }), (req, res, next) => {

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
