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
  const firstname = req.body.user.firstname;
  const lastname = req.body.user.lastname;
  const phone = req.body.user.phone;
  const isAdmin = req.body.user.isAdmin;
  const isDriver = req.body.user.isDriver;
  const isRemoved = req.body.user.isRemoved;

  db.query('UPDATE users SET firstname = ?, lastname = ?, phone = ? , isAdmin = ? , isDriver = ?, isRemoved = ? WHERE id = ?',
                              [firstname, lastname, phone, isAdmin, isDriver, isRemoved, id], function(error, rows) {
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