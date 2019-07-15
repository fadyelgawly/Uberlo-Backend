const db = require('../database');



exports.patchUserAsAdmin = (req, res) => {


  console.log("hiii");
  const isAdminUser = req.user.isAdmin;

  console.log("hiii");
  if (!isAdminUser){
    res.status(500).json({
      error: "Only admin are allowed to use this update function"
    })
    return;
  }
  const id = req.body.user.id
  const firstname = req.body.firstname;
  const username = req.body.username;
  const lastname = req.body.lastname;
  const phone = req.body.phone;
  const isAdmin = req.body.isAdmin;
  const isDriver = req.body.isDriver;
  const isRemoved = req.body.isRemoved;

  db.query('UPDATE users SET username = ?, firstname = ?, lastname = ?, phone = ? , isAdmin = ? , isDriver = ?, isRemoved = ? WHERE id = ?',
                              [username, firstname, lastname, phone, isAdmin, isDriver, isRemoved, id], function(error, rows) {
          if (error){
            res.status(500).json({
              error: error
            });
          } else if (rows.affectedRows){
            res.status(200).json({
              update: "success"
            });
          }
        });
}


exports.patchUser = (req, res) => {
  const id = req.user.id;
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const phone = req.body.phone;

  db.query('UPDATE users SET firstname = ?, lastname = ?, phone = ? WHERE id = ?;',
        [firstname, lastname, phone , id], function(error, rows) {
          if (error){
            res.status(500).json({
              error: error
            });
          } else if (rows.affectedRows){
            res.status(200).json({
              update: "success"
            });
          }
        });
}