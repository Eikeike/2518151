//This is all you need
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const session = require('express-session')
const request = require('request');
const Auth = require("./authUtil/signup")
const InitDB = require("./authUtil/database")

//Init app
const app = express();

//connect to Database for user login
InitDB();

//again, some stuff you just need
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/../public'));
app.use(cookieParser());

//Set up sessions for users
app.use(session({
    key: "loggedIn",
    secret: "geheimnisAufDeutsch",
    resave: true,
    saveUninitialized: false
}));

/**
 * checks if a user is logged in. If he is, redirect to home. 
 * This is meant to be middleware for routes that want to access home. 
 * That way we don't have to check everytime
 * @param req request
 * @param res response
 * @param next next function to use on failure. Automatically supplied 
 */
var checkSession = function(req, res, next) {
    if (req.session.user && req.cookies.loggedIn) {
        console.log('logged in!');
        res.redirect('/home')
    } else {
        next();
    }
}

/**
 * Checks a request and returns true if the user is logged in
 * @param res request that is checked 
 * @param res response that we use to redirect on failure
 */
function validSession(req, res) {
    if (req.session.user && req.cookies.loggedIn) {
        return true;
    } else {
        res.redirect('/login');
        return false;
    }
}
//Server starts here. Port 3000 just because
var server = app.listen(3000, function() {
    console.log("Server started at port 3000")
});

//get static documents, but only if you are logged in
app.get('/static/:document.:extension', function(req, res) {
    if (validSession(req, res)) {
        var docname = "/" + req.params.extension + "/" + req.params.document + "." + req.params.extension;
        var options = {
            root: __dirname + '/../public',
        }
        res.sendFile(docname, options, function(err) {
            if (err) { res.send(err); } else {
                console.log('Sent:', docname);
            }
        });
    }
});

//redirect to the best website in the world
app.get('/redirect', function(req, res) {
    res.redirect('https://www.eikewobken.de');
});


//redirects to home if the session is valid. If not, direct to login
app.get('/', checkSession, (req, res) => {
    res.redirect('/login')
})

//deletes all cookies (so that authentication always fails) and redirects the user to the login page
app.get('/logout', (req, res) => {
    if (validSession(req, res)) {
        res.clearCookie('loggedIn');
        res.clearCookie('username');
        res.clearCookie('role');
        res.redirect('/login');
    }
});

//checks if user is already logged in. If he is, just take him home. If he's not, send login form
app.route('/login').get(checkSession, (req, res) => {
        var docname = "/htm/login.htm";
        var options = { root: __dirname + '/../public/' }
        res.sendFile(docname, options, function(err) {
            if (err) {
                res.send(err);
            }
        });
    })
    .post((req, res) => Auth.authenticate(req, res));

//checks if user is already logged in. If he is, just take him home. If he's not, send register form
//This means that a user can only sign up when he is logged out(which makes sense)
app.route('/signup').get(checkSession, (req, res) => {
    var docname = "/htm/signup.htm";
    var options = { root: __dirname + '/../public/' }
    res.sendFile(docname, options, function(err) {
        if (err) {
            res.send(err);
        }
    });
}).post((req, res) => Auth.register(req, res));

//sends the main file (index) to the user. To get home, he has to be logged in.
app.get('/home', function(req, res) {
    if (req.session.user && req.cookies.loggedIn) {
        var docname = "/index.htm";
        var options = { root: __dirname + '/htm' }
        res.cookie('username', req.session.user.username, { HttpOnly: false, maxAge: 3600 * 1000 });
        res.cookie('role', req.session.user.role, { HttpOnly: false, maxAge: 3600 * 1000 });
        res.sendFile(docname, options, function(err) {
            if (err) {
                res.send(err);
            }
        });
    } else {
        res.redirect("/login");
    }
})

//Takes the user to the dashboard, where he can view dynamic content.
//This only works if he is logged in and also has rich user access
app.get('/dashboard', (req, res) => {
    if (validSession(req, res) && req.session.user.role == "rich") {
        var docname = "/dashboard.htm";
        var options = { root: __dirname + '/htm' }
        res.sendFile(docname, options, function(err) {
            if (err) {
                res.send(err);
            }
        });
    } else {
        res.cookie('username', req.session.user.username, { HttpOnly: false, maxAge: 3600 * 1000 });
        res.cookie('role', req.session.user.role, { HttpOnly: false, maxAge: 3600 * 1000 });
        res.redirect('/home')
    }
});

//Provides a proxy server, for example for REST calls. Can be accessed even by users who aren't logged in.
app.all('/proxy', function(req, res) {
    var decompose = req.originalUrl.split("?");
    var fullurl = decompose[1] + "?" + decompose[2];
    fullurl = fullurl.replace("url=", "");
    console.log("Proxy Server reached", fullurl);
    var o = { uri: fullurl, method: req.method, json: true };
    request(o, function(e, r, b) {
        if (e) {
            res.send({ error: e, status: "Error", request: o, response: e });
        } else {
            res.send({ error: e, status: r.statusCode, request: o, response: b });
        }
    });
});

//If everything fails, 404
app.use(function(req, res, next){
    res.status(404);
    var docname = "/fourofour.htm";
    var options = { root: __dirname + '/htm' }
    res.sendFile(docname, options, function(err) {
        if (err) {
            res.send(err);
        }
    });
})