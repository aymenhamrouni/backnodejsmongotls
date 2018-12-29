const express = require("express");
const cors = require("cors");
const app = express();

const whitelist = [
  "http://localhost:3000",
  "http://localhost:8100",
  "https://localhost:8433"
];

var corsOptionsDelegate = (req, callback) => {
  var corsOptions;
  if (whitelist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: true };
  } else {
    corsOptions = { origin: false };
  }

  callback(null, corsOptions);
};

exports.corsWithOptions = cors(corsOptionsDelegate);
exports.cors = cors();
