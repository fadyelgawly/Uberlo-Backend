const jwt = require('jsonwebtoken');
const passportJWT = require('passport-jwt');
const database = require('../database');
const bcrypt = require('bcrypt-nodejs');

let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;

    
let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('JWT');
jwtOptions.secretOrKey = 'wowwow';

// lets create our strategy for web token
let strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
  console.log('payload received', jwt_payload);
  let user = getUser({ id: jwt_payload.id });

  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
});
//passport.use(strategy);


exports.signup = (parameters, res) => {

    const
        username = parameters.username,
        password = bcrypt.hashSync(parameters.password, null, null),
        firstname = parameters.firstname,
        lastname = parameters.lastname,
        phone = parameters.phone,
        isDriver = parameters.isDriver;
    if (!(username && password && firstname && lastname && phone && isDriver)){
        res.status(500).json({error : "missing requirement(s)",
                            expected : "username && password && firstname && lastname && phone && isDriver"
                            });
                            return;
    }

    const usernames = `SELECT username FROM users WHERE username = "${username}" OR phone = ${phone}`;
    const insertQuery = `INSERT INTO users ( username, password, firstname,lastname , phone, isDriver) values (?,?,?,?,?,?)`;
    database.query(usernames, (error, rows) => {
        if (error)
            res.status(401).json({ error:error });
        else
            if (rows.length == 0)
                database.query(insertQuery, [username, password, firstname, lastname, phone, isDriver], (error, rows) => {
                    if(error)
                        res.status(500).json({ error:error });
                    else
                        res.status(200).json({ signup :"success" });
                });
            else
                res.status(500).json({ error :"user already exist" });
    });
}

exports.login = (parameters, res) => {

    const { username, password } = req.body;
    if (username && password) {
        const queryStatement = `SELECT username FROM users WHERE username = "${username}" AND password = "${bcrypt.hashSync(password, null, null)}"`;
        database.query(queryStatement, (error, rows) =>{
            if (error)
                res.status(401).json({ error:error });
            else
                if (!rows.length)
                    res.status(401).json({ message: 'Invalid credentials'});
                else {
                    // let payload = { id: username.id };
                    // let token = jwt.sign(payload, jwtOptions.secretOrKey);
                    res.status(200).json({ msg: 'ok', token: token });
                }
        })
    }
}