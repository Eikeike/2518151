const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./User");
//const router = express.Router();


const register = (req, res) => {
    bcrypt.hash(req.body.password, 10, function(err, hashedpw){
        if(err){
            res.json({
                error: err
            })
        }
        User.findOne({username: req.body.username}).then((user) => {
            if(!user){
                let role = "";
                if(req.body.username.includes('rich')){
                    role = "rich"
                }
                else{
                    role = "poor"
                }
                let user = new User({
                    username: req.body.username,
                    password: hashedpw,
                    role: role
                })  
             user.save().then(user => {
                res.json({
                    message: req.body.username + " has been added successfully",
                })
            }).catch(error => 
                res.json({
                    message: error
                }))
            }
            else{
                res.json({
                    message:'Dieser Nutzername ist bereits vergeben',
                    location: "signup"
                })
            }
        })
    })
}

const authenticate = (req, res) => {
    console.log("auth");
    try{
        var username = req.body.username,
            password = req.body.password
            console.log(password);
        User.findOne({username: username}).then((user) => {
            if(!user){
                res.json({
                    message:'wrong username'
                })
            }
            else if(!bcrypt.compareSync(password, user.password)){
                res.json({
                    message:'wrong password'
                })
            }
            else{
                console.log(user);
                req.session.user = user;
                res.json({
                    message:'redirect',
                    location:'home'
                })
            }
            })
    }
    catch(e){
        res.json({
            message: 'Login failed - please try again'
        })
    }
}
/*router.post('/register', register)
router.post('/login', authenticate)*/
module.exports = {register, authenticate}