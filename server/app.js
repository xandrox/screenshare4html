
/**
 * Module dependencies.
 */

const express = require('express'),
    app = express.createServer(),
    io = require('socket.io').listen(app),
    fs = require("fs");

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Express'
  });
});

app.get("/transmitter", function(req, res) {
    fs.readFile(__dirname + "/views/github.html", "utf8", function (err, data) {
        if (err) throw err;
        res.send(data);
    });
});

app.get("/session/:sessionId", function(req, res) {
    res.render("slave", {title: 'Express', sessionId: req.params.sessionId});
});

app.listen(3000);

io.configure(function () {
    io.set("log level", 2);
});

io.of('/transmitter')
    .on('connection', function (serverSocket) {
        console.log("client connected");

        serverSocket.on("observe", function(data) {
            console.log("new listener on URL: /session/" + data.sessionId);
            serverSocket.join(sessionTopicName(data.sessionId));
        });

        serverSocket.on("image", function (data) {
            serverSocket.broadcast
                .to(sessionTopicName(data.sessionId))
                .emit("image", data);

        });

    });

function sessionTopicName(sessionId) {
    return "foo";
    //return "session-" + sessionId;
}

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
