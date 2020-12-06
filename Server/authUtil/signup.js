//This file created functions that sign up a user and authenticate him. Note: These are only functions that will be routed at a later time. Nothing happens here yet.

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./User");
//const router = express.Router();


const register = (req, res) => {
    //Take the password and hash it. Then call a function with the password
    bcrypt.hash(req.body.password, 10, function(err, hashedpw){
        if(err){
            res.json({
                message: err
            })
        }
        if(req.body.password.length < 6){
            res.json({
                message:"Minimum length of password is 6 characters",
                location:"signup"
            })
            console.log("Error-MinLength not given");
        }else{
            signUpUser(req, res);
        }
        
    })
}

/**
 * Helper function for better readability
 * @param {} req Request from POST
 * @param {} res Response given to Client
 */
function signUpUser(req, res){
    //If the username doesnt exist in the database, go ahead
    User.findOne({username: req.body.username}).then((user) => {
        if(!user){
            //I didn't want to do everything manually. This is a solution just for development. 
            //If the user's username contains the word rich, he is a rich user. Otherwise he isn't
            let role = "";
            if(req.body.username.includes('rich')){
                role = "rich"
            }
            else{
                role = "poor"
            }
            //store user
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
            //If the username is taken, redirect the user to signup page. The redirect is done on client side for several reasons. 
            //Mostly it's because on form submit, the page is not reloaded, so a redirect requires a manual reload. 
            //Might be a security issue, idk
            res.json({
                message:'Username is already taken',
                location: "signup"
            })
        }
    })
}
/**
 * Provide functionality for checking if a user is registered
 * @param {} req request from client
 * @param {} res response to client
 */
const authenticate = (req, res) => {
    console.log("Looking up user");
    try{
        var username = req.body.username,
            password = req.body.password
        User.findOne({username: username}).then((user) => {
            //if user cannot be found, the username is wrong
            if(!user){
                res.json({
                    message:'wrong username'
                })
            }
            //if found but passwords do not match, password is wrong
            else if(!bcrypt.compareSync(password, user.password)){
                res.json({
                    message:'wrong password'
                })
            }
            //if noting happens, the user is logged in.
            else{
                console.log("user logged in");
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
module.exports = {register, authenticate}