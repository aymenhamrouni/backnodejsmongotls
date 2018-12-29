const config = require("../env.config");
const mongoose = require("mongoose");
mongoose.connect(
  "mongodb://localhost:27017/smarthome",
  { useNewUrlParser: true }
);

const express = require("express");
const bodyParser = require("body-parser");
var app = require("../app");
const SecurityRouter = require("../routes/auth");
const IdentityRouter = require("../routes/userss");
SecurityRouter.routesConfig(app);
IdentityRouter.routesConfig(app);
const HomeModel = require("../models/Home");
var mqtt = require("mqtt");
var debug = require("debug")("node-express-generator:server");
var http = require("http");

config.initRefreshSecret();

//voir Helmet.md
const tls = require("spdy"); //http2 + https (tls)
const fs = require("fs");
let helmet = require("helmet");

const options = {
  key: fs.readFileSync("./tls/test-key.pem"),
  cert: fs.readFileSync("./tls/test-cert.pem")
};

app.use(helmet());

app.use(bodyParser.json());

var port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

var https = tls.createServer(options, app).listen(config.port, error => {
  if (error) {
    console.error(error);
    return process.exit(1);
  } else {
    console.log(
      "Express Sever Configured with HTTP2 and TLSv1.2 and listening on port: " +
        config.port +
        "."
    );
  }
});

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

//////////////////////////////////////////////////////////////////
var optionsmqtt = {
  port: 1883,
  host: "mqtt://127.0.0.1",
  clientId: "mqttjs_",
  /* Math.random()
      .toString(16)
      .substr(2, 8) */ keepalive: 1020,
  reconnectPeriod: 1000,
  protocolId: "MQIsdp",
  protocolVersion: 3,
  clean: true,
  encoding: "utf8"
};

//var io = require("socket.io").listen(server);
io = require("socket.io")(https, {
  origins: "*:*"
});
var client = mqtt.connect(
  "mqtt://127.0.0.1",
  optionsmqtt
);

/**
 * Listen on provided port, on all network interfaces.
 */
var i = 0;
io.on("connect", socket => {
  socket.on("home", msg => {
    console.log(msg);

    client.publish(JSON.parse(msg).change.toString(), {
      Sensor: JSON.parse(msg).WindowsSensors.toString()
    });
  });
});
client.on("message", function(topic, payload) {
  // console.log('message received');
  //console.log(payload);
  //console.log(String(payload));
  io.sockets.emit(String(topic), {
    topic: String(topic),
    payload: String(payload)
  });
  HomeModel.createIdentity(JSON.parse(String(payload)))
    .then(result => {
      console.log(result);
    })
    .catch(err => {
      HomeModel.findByHomeId(JSON.parse(String(payload)).homeId)
        .then(re => {
          HomeModel.putIdentity(re._id, JSON.parse(payload))
            .then(res => {})
            .catch(err => {});
        })
        .catch(err => {});
    });
});

/* io.on("connect", () => {
  console.log("Client connected");
}); */

client.on("connect", function() {
  // When connected
  console.log("connected to the broker");
  // subscribe to a topic
  client.subscribe(["home_1", "home_2"], function() {
    // when a message arrives, do something with it
  });
});

///////////////////////////////////////////////////////////////////////////////////////
server.listen(port,(err) => {
  if (err)
  {
    console.error(error);
    return process.exit(1);
  }
  else 
  {
    console.log("listening on a HTTP server on port", "3000");

  }
});
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}

//

//server = require('http').createServer(app);

// create a socket object that listens on port 5000
//var io = require('socket.io').listen(server);

// create an mqtt client object and connect to the mqtt broker

/* io.sockets.on('connection', function (socket) {
        console.log('hi');
        // socket connection indicates what mqtt topic to subscribe to in data.topic
        socket.on('subscribe', function (data) {
            console.log('Subscribing to '+data.topic);
            socket.join(data.topic);
            client.subscribe(data.topic);
        });
        // when socket connection publishes a message, forward that message
        // the the mqtt broker
        socket.on('publish', function (data) {
            console.log('Publishing to '+data.topic);
            client.publish(data.topic,data.payload);
        });
    }); */

// listen to messages coming from the mqtt broker
