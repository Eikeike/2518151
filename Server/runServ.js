
const express = require('express');        
const bodyParser = require('body-parser'); 
const request = require('request');        
const Auth = require("./authUtil/signup")
const InitDB = require("./authUtil/database")
//const InitMongo = require("./database")

const app = express();

InitDB();

app.use(express.static(__dirname + '/../public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


var server = app.listen(6001, function() {
  console.log("Server started at port 6001")
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

app.get('/home', function(req, res){
  var docname = "/htm/index.htm";
  var options = {root: __dirname + '/../public/'}
  res.sendFile(docname, options, function (err) { 
   if (err) {
     res.send(err);
   } else {
     console.log('Sent:', docname);
   }
 });
});

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

app.use("/auth", Auth)

