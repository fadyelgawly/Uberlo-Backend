var db = require('../database');

exports.requestRide = (req, res) => {
    const
        rider = req.user.id,
        fromArea = req.body.fromArea,
        toArea = req.body.toArea;
        promo = req.body.promo
        if (!(fromArea && toArea)){
            res.status(500).json({error : "missing requirement(s)",
                                expected : "fromArea && toArea"
                                });
                                return;
        }
    
    db.query("INSERT INTO ride ( rider, fromArea, toArea, promo) values (?,?,?, ?)",[rider ,fromArea, toArea, promo], function(err, rows) { //TODO: rider id

        if (err){
            res.status(500).json({
                message: err.message
            });
        }
        else {
            if (rows.affectedRows){
                res.status(200).json({
                    successful: true
                });   
            } else {
                res.status(500).json({
                    successful: false
                });
            }  
        }
    });
}



