const jwt = require('jsonwebtoken');
const passportJWT = require('passport-jwt');
const database = require('../database');
const bcrypt = require('bcrypt-nodejs');
const passport = require('passport');

let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;


let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('JWT');
jwtOptions.secretOrKey = 'wowwow';

// lets create our strategy for web token

let strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
    const usernames = `SELECT * FROM users WHERE id = "${jwt_payload.id}"`;
    database.query(usernames, (error, rows) => {
        if (rows) {
            let user = { ...rows[0] };
            return next(null, user);
        } else next(null, false);
    });
});

passport.use(strategy);

exports.getUser = id => {
    const usernames = `SELECT * FROM users WHERE id = "${id}"`;
    database.query(usernames, (error, rows) => {
        if (error || !rows) return null;
        if (rows) return rows[0];
    });
};


exports.signup = (parameters, res) => {

    const
        username = parameters.username,
        password = bcrypt.hashSync(parameters.password, null, null),
        firstname = parameters.firstname,
        lastname = parameters.lastname,
        phone = parameters.phone,
        isDriver = parameters.isDriver;
    if (!(username && password && firstname && lastname && phone)) {
        res.status(500).json({
            error: "missing requirement(s)",
            expected: "username && password && firstname && lastname && phone"
        });
        return;
    }

    const usernames = `SELECT username FROM users WHERE username = "${username}" OR phone = "${phone}"`;
    const insertQuery = `INSERT INTO users ( username, password, firstname,lastname , phone, isDriver) values (?,?,?,?,?,?)`;
    database.query(usernames, (error, rows) => {
        if (error)
            res.status(401).json({ error: error });
        else
            if (rows.length == 0)
                database.query(insertQuery, [username, password, firstname, lastname, phone, isDriver], (error, rows) => {
                    if (error)
                        res.status(500).json({ error: error });
                    else
                        if (isDriver) {
                            const getquery = `SELECT id FROM users WHERE username = "${username}"`;
                            database.query(usernames, (error, rows) => {
                                if (error) {
                                    res.status(401).json({ error: error });
                                    return;
                                }
                                const driverInsert = `INSERT INTO driver ( id, isAvailable) values ("${rows[0].id}", "0")`;;
                                database.query(driverInsert, (error, rows) => {
                                    if (error) {
                                        res.status(401).json({ error: error });
                                        return;
                                    } else {
                                        res.status(200).json({ signup: "success" });
                                    }

                                });


                            });

                        }
                    res.status(200).json({ signup: "success" });
                });
            else
                res.status(500).json({ error: "user already exist" });
    });
}

exports.login = (parameters, res) => {

    const username = parameters.username;
    const password = parameters.password;

    if (username && password) {
        const queryStatement = `SELECT * FROM users WHERE username = "${username}"`;
        database.query(queryStatement, (error, rows) => {
            if (error)
                res.status(401).json({ error: error });
            else
                if (!rows.length)
                    res.status(401).json({ message: 'Invalid credentials' });
                else if (bcrypt.compareSync(password, rows[0].password)) {
                    let payload = { id: rows[0].id };
                    let token = jwt.sign(payload, jwtOptions.secretOrKey);
                    res.status(200).json({
                        msg: 'ok',
                        token: token,
                        user: rows[0]
                    });
                } else {
                    res.status(500).json({ error: 'Incorrect password' });
                }
        })
    } else {
        res.status(500).json({ error: 'No credentials' });
    }
}

exports.changepassword = (req, res) => {

    const id = req.user.id;
    const oldPassword = req.body.oldPassword;
    const newPassword = bcrypt.hashSync(req.body.newPassword, null, null);


    if (req.body.oldPassword && req.body.newPassword) {
        const queryStatement = `SELECT * FROM users WHERE id = "${id}"`;
        database.query(queryStatement, (error, rows) => {
            if (error) {
                res.status(500).json({ error: error.message });
            } else if (!rows[0]) {
                res.status(500).json({ error: 'Userid doesnt exist' });
            } else if (rows[0]) {
                if (bcrypt.compareSync(oldPassword, rows[0].password)) {
                    database.query("UPDATE users SET password = ? WHERE id = ?", [newPassword, id], function (err, rows) {
                        if (err) {
                            res.status(500).json({ error: error.message });
                        } else if (rows.affectedRows) {
                            database.query("INSERT INTO password ( userID, passwordHash, changedBy) values (?,?,?)", [id, newPassword, id],
                                function (err, rows) {
                                    if (err || !rows.affectedRows) {
                                        res.status(500).json({
                                            update: 'success',
                                            message: 'Record was not saved',
                                            sql: err.message
                                        });
                                    } else {
                                        res.status(200).json({ message: 'success' });
                                    }
                                });
                        }
                    });
                } else {
                    res.status(500).json({ error: 'Password incorrect' });
                }
            } else {
                res.status(500).json({ error: 'Please tell Fady you reached this.' });
            }
        });
    } else {
        res.status(500).json({ error: 'No credentials' });
    }
}