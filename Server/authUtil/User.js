/***
 * This file creates a MongoDB Schema in which we store the user at a later time. It contains info about username, password (hashed) and the role.
 * There really is no reason why i made this a file. I just thought it looked nicer
 */


//Some things we just need

const mongoose = require("mongoose");
//create Schema.
let Schema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        default: 'poor'
    }
});
module.exports = mongoose.model('user', Schema)