const db = require('../database');



exports.patchUserAsAdmin = (req, res) => {



  const id = req.body.id
  const firstname = req.body.firstname;
  const username = req.body.username;
  const lastname = req.body.lastname;
  const phone = req.body.phone;
  const isAdmin = req.body.isAdmin;
  const isDriver = req.body.isDriver;
  const isRemoved = req.body.isRemoved;
  const credit = req.body.credit;
  const isAdminUser = req.user.isAdmin;

  if (!isAdminUser) {
    res.status(500).json({
      error: "Only admin are allowed to use this update function"
    })
    return;
    
  }
  db.query('UPDATE users SET username = ?, firstname = ?, lastname = ?, phone = ? , isAdmin = ? , isDriver = ?, isRemoved = ?, credit = ? WHERE id = ?',
    [username, firstname, lastname, phone, isAdmin, isDriver, isRemoved, credit, id],
    function (error, rows) {
      if (error) {
        res.status(500).json({
          error: error
        });
      } else if (rows.affectedRows) {
        console.log(isAdmin);
        console.log(isDriver);
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
    [firstname, lastname, phone, id], function (error, rows) {
      if (error) { 
        res.status(500).json({
          error: error
        });
      } else if (rows.affectedRows) {
        res.status(200).json({
          update: "success"
        });
      }
    });
}