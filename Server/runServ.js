
const express = require('express');        
const bodyParser = require('body-parser'); 
const cookieParser = require('cookie-parser')
const session = require('express-session')
const request = require('request');        
const Auth = require("./authUtil/signup")
const InitDB = require("./authUtil/database")

const app = express();

InitDB();

app.use(express.static(__dirname + '/../public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(cookieParser());
app.use(session({
  key: "loggedIn",
  secret: "geheimnisAufDeutsch",
resave:true,
saveUninitialized: false}));

//this is used both for login and registration

var server = app.listen(3000, function() {
  console.log("Server started at port 3000")
});

app.get('/static/:document.:extension', function(req, res){
   var docname = "/" + req.params.extension + "/" + req.params.document+ "." + req.params.extension ;
   var options = {
   root: __dirname + '/../public',
   }
   res.sendFile(docname, options, function (err) { 
    if (err) {res.send(err);}
     else {console.log('Sent:', docname);
    }
  });
});

app.get('/redirect', function(req, res){
   res.redirect('https://www.eikewobken.de');
});

app.get('/sessionDetails', (res, req) =>{
  console.log(req.json);
  res.json({
    username: req.session.user.username,
    role: req.session.user.role
  })
})

app.get('/static/:document.:extension', function(req, res){
  var docname = "/" + req.params.extension + "/" + req.params.document+ "." + req.params.extension ;
  var options = {
  root: __dirname + '/public/',
  }
  res.sendFile(docname, options, function (err) { // send the file !!
   if (err) {res.send(err);}
    else {console.log('Sent:', docname);
   }
 });
});

/**
 * checks if a user is logged in. If he is, redirect to home. If he is not, do whatever is specified next (usually login)
 * @param {request} req 
 * @param {response} res 
 * @param {next middleware to use} next 
 */
var checkSession = function(req,res,next) {
  console.log(req.cookies['loggedIn'])
  if(req.session.user && req.cookies.loggedIn){
    console.log('logged in!');
    res.redirect('/home')
  }
  else{
    next();
  }
}

app.get('/', checkSession, (req, res)=>{
  res.redirect('/login')
})

app.get('/logout', (req, res) => {
  if (req.session.user && req.cookies.loggedIn) {
      res.clearCookie('loggedIn');
      res.redirect('/');
  } else {
      res.redirect('/login');
  }
});

app.route('/login').get(checkSession, (req, res) => {
  var docname = "/htm/login.htm";
  var options = {root: __dirname + '/../public/'}
  res.sendFile(docname, options, function (err) { 
   if (err) {
     res.send(err);
   }
 });
})
.post((req, res) => Auth.authenticate(req,res));

app.route('/signup').get(checkSession, (req, res) => {
  var docname = "/htm/signup.htm";
  var options = {root: __dirname + '/../public/'}
  res.sendFile(docname, options, function (err) { 
   if (err) {
     res.send(err);
   }
 });
}).post((req,res) => Auth.register(req, res));

app.get('/home', function(req, res){
  if(req.session.user && req.cookies.loggedIn){
  var docname = "/htm/index.htm";
  var options = {root: __dirname + '/../public/'}
  res.cookie('username', req.session.user.username, {HttpOnly: false, maxAge: 30*1000});
  res.cookie('role', req.session.user.role, {HttpOnly: false, maxAge: 30*1000});
  res.sendFile(docname, options, function (err) { 
   if (err) {
     res.send(err);
   }
 });
}
else{
  res.redirect("/login");
}
})

app.all('/proxy', function(req, res){
    var decompose = req.originalUrl.split("?");
    var fullurl = decompose[1] + "?" + decompose[2];
    fullurl = fullurl.replace("url=","");
    console.log("Proxy Server reached", fullurl);
    var o = {uri: fullurl,method: req.method,json: true};
    request(o, function(e, r, b){
      if(e) {
          res.send({error: e, status: "Fehler", request: o, response: e});
      } else {
          res.send({error: e, status: r.statusCode, request: o, response: b});
      }
    });
});



