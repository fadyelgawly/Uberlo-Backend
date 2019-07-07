var db = require('../database');

exports.requestRide = (req, res) => {
    const
        rider = req.user.id,
        fromArea = req.body.fromArea,
        toArea = req.body.toArea;
        if (!(fromArea && toArea)){
            res.status(500).json({error : "missing requirement(s)",
                                expected : "fromArea && toArea"
                                });
                                return;
        }
    
    db.query("INSERT INTO ride ( rider, fromArea, toArea) values (?,?,?)",[rider ,fromArea, toArea], function(err, rows) { //TODO: rider id

        if (err){
            res.status(500).json({
                message: err.message
            });
        }
        else {
            if (rows.affectedRows){
                res.status(200).json({
                    message: 'request-submit-success'
                });   
            } else {
                res.status(500).json({
                    message: 'request-submit-failure'
                });
            }  
        }
    });
}


exports.getavailablerides = (parameters, res) => {
    const fromArea = parameters.fromArea
    if (!fromArea){
        res.status(500).json({
            error: "missing fromArea"
        });
        return;
    }
    connection.query("SELECT * FROM ride WHERE driver = null AND fromArea = ?",[fromArea], function(err, rows) { 
        if (err)
            res.status(500).json({
                message: err.message
            });
        res.status(200).json({
            rides: rows
        });
    });
}

