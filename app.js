var createError = require("http-errors");
var express = require("express");
var path = require("path");
var logger = require("morgan");
var session = require("express-session");

var mongoose = require("mongoose");
//var indexRouter = require("./routes/index");
//var uploadRouter = require("./routes/uploadRouter");

var config = require("./env.config");
const homevalues=require('./routes/homevalues')
const SecurityRouter = require("./routes/auth");
const IdentityRouter = require("./routes/userss");

var app = express();

/*  app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  } else {
     res.redirect(
      307,
      "https://" + req.hostname + ":" + config.port + req.url
    ); 
  }
});  */
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(function(req, res, next) {
  whiteList = ["*"];
  res.header("Access-Control-Allow-Origin", whiteList);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  res.header("Access-Control-Expose-Headers", "Content-Length");
  res.header(
    "Access-Control-Allow-Headers",
    "Accept, Authorization, Content-Type, X-Requested-With, Range"
  );
  if (req.method === "OPTIONS") {
    return res.send(200);
  } else {
    return next();
  }
});
//app.use("/", indexRouter);
SecurityRouter.routesConfig(app);
IdentityRouter.routesConfig(app);
app.use("/values",homevalues);
// app.use(auth);

app.use(express.static(path.join(__dirname, "public")));
//app.use("/upload", uploadRouter);

// catch 404 and forward to error handler

// error handler
/* app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
}); */

module.exports = app;
