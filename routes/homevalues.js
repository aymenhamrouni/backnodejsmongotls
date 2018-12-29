const mqtt = require("mqtt");
var optionsmqtt = {
  port: 1883,
  host: "mqtt://127.0.0.1",
  clientId:
    "mqttjs_" +
    Math.random()
      .toString(16)
      .substr(2, 8),

  keepalive: 60,
  reconnectPeriod: 1000,
  protocolId: "MQIsdp",
  protocolVersion: 3,
  clean: true,
  encoding: "utf8"
};

//var io = require("socket.io").listen(server);
var client = mqtt.connect(
  "mqtt://127.0.0.1",
  optionsmqtt
);
const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const AuthorizationValidation = require("../security/authorization/authorization.validation");
const AuthorizationPermission = require("../security/authorization/authorization.permission");
const Dishes = require("../models/values");
//const cors = require('./cors');
const valuesRouter = express.Router();
valuesRouter.use(bodyparser.json());

/* valuesRouter.route('/')
.post(AuthorizationValidation.validJWTNeeded,(req, res, next) => { 
    
   console.log(req.body)
    var a = JSON.parse(String(JSON.stringify(req.body)));
    client.publish("home_3", JSON.stringify(a));
    res.sendStatus(201);
    res.end("lol");

}) */
valuesRouter
  .route("/")
  .post(AuthorizationValidation.validJWTNeeded, (req, res, next) => {
    res.sendStatus(201);
    client.publish(req.body.change, req.body.NewValue);
  });
module.exports = valuesRouter;
