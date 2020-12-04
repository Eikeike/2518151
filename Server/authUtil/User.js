const mongoose = require("mongoose");

const MONGO = "mongodb+srv://admin:passwort@auth.vghcn.mongodb.net/auth?retryWrites=true&w=majority"; //String i got from mongodb cloud. This is so that you do not have to install MongoDB when trying things out

let Schema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    }
});
module.exports = mongoose.model('user', Schema)