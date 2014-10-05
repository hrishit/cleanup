var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var google = require('https://maps.googleapis.com/maps/api/js?v=3.exp');
//<script src="https://maps.googleapis.com/maps/api/js?v=3.exp"></script>

var routes = require('./routes');
var users = require('./routes/user');

var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'hrishit'
});

connection.query('USE cleanup');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
 
  next();
 });

app.get('/', routes.index);

app.get('/sunburstchart', function(request, response) {
        //response.writeHead(200, {
          //  "Content-Type": "text/plain",
        //});
    
    connection.query('SELECT * FROM sensordata JOIN bindata ORDER BY bindata.City, bindata.Circle, bindata.Zone, bindata.Ward, bindata.Area', function(err, rows){
        var string = "";
        for(var i = 0; i < rows.length; i++) {
            if(rows[i].Ward == "")
                rows[i].Ward = "Alwal";
            if(rows[i].Area == "")
                rows[i].Area = "I";
            string += rows[i].City + '-' + rows[i].Circle + '-' + rows[i].Zone + '-' + rows[i].Ward + '-' + rows[i].Area + ',' + rows[i].binlevel + '\n';
        }   
        response.contentType("text/plain");
        response.send(JSON.stringify(string));
    
        });        
});
        
app.get('/pickupath', function(request, response) {
    connection.query('SELECT * FROM pickuppoints INNER JOIN bindata ON pickuppoints.binId = bindata.binId', function(err, rows){
        
            var string = "";
            for(var i = 0; i < rows.length; i++) {
                string += rows[i].Circle + ',';
            }
        //string.substr(0, string.length - 2);
        response.contentType("text/plain");               
        response.send(string.substr(0, string.length - 1));
    
        });        
});

app.get('/getdistance', function(request, response) {
    response.send(calculateDistances());
});

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}


// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: {}
    });
});




module.exports = app;
