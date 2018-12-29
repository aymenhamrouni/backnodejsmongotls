var express = require("express");
var router = express.Router();
const bodyParser = require("body-parser");
var User = require("../models/user");
var router = express.Router();
router.use(bodyParser.json());

const cors = require("./cors");
var authenticate = require("../authenticate");
var passport = require("passport");


router.options('*', cors.corsWithOptions, (req, res) => {  res.sendStatus(200); } )

/*router.route('/')
   .all((req, res, next) => {
    next();
    // console.log(req);
  }) */
  router.get('/',cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { //admin can do this
    User.find({})
      .then((users) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(users);
      }, (err) => next(err))
      .catch((err) => next(err));
  })


router.post("/signup", cors.corsWithOptions, function(req, res, next) {
  console.log(req.body);
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ err: err });
      } else {
        if (req.body.firstname) {
          user.firstname = req.body.firstname;
        }
        if (req.body.lastname) {
          user.lastname = req.body.lastname;
        }
        user.save((err, user) => {
          if (err) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ err: err });
            return;
          }
          passport.authenticate("local")(req, res, () => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({ success: true, Status: "Registration Successful" });
          });
        });
      }
    }
  );
});

router.post("/login", cors.corsWithOptions, passport.authenticate("local"), (req, res) => {
  var token = authenticate.getToken({ _id: req.user._id });
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.json({
    success: true,
    token: token,
    Status: "You are Successfuly logged in!"
  });
});

router.get("/logout", cors.corsWithOptions, (req, res, next) => {
  if (req.session) {
    req.session.destroy(); //destroy the session and information is removed from the server side
    res.clearCookie("session-id"); // destroy the cookie from the client side
    res.redirect("/");
  } else {
    var err = new Error("you are not logged in!");
    err.statusCode = 403;
    next(err);
  }
});

module.exports = router;
