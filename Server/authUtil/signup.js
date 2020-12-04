const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./User");
const router = express.Router();

const register = (req, res, next) => {
    bcrypt.hash(req.body.password, 10, function(err, hashedpw){
        if(err){
            res.json({
                error: err
            })
        }
        let user = new User({
            username: req.body.username,
            password: hashedpw
        })
        user.save().then(user => {
            res.json({
            message: "You have been added!"
            })
        }).catch(error => 
            res.json({
                message: error
            }))
    })

}
router.post('/register', register)
module.exports = router