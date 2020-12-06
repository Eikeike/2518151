/**
 * Connect to the MongoDB database in which users are stored
 * This is just a single  file to reduce the number of "ugly" code lines in the server file
 */

const mongoose = require("mongoose");

const MONGO = "mongodb+srv://admin:passwort@auth.vghcn.mongodb.net/auth?retryWrites=true&w=majority"; //String i got from mongodb cloud. 
//This is so that you do not have to install MongoDB when trying things out. Note: admin:password is ONE user I created. Those are not my login credentials for Atlas
const Init = async() => {
    try {
        await mongoose.connect(MONGO, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Datenbank verbunden")
    } catch (e) {
        console.log(e);
        process.exit(1);
    }
};

module.exports = Init;