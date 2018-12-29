var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var passportLocalMongoose = require("passport-local-mongoose");

var User = new Schema({
    email : {
        type : String,
        default : ''
    },
    homeId : {
        type : String,
        default :''
    },
    userName : {
        type : String,
        default :''
    }, 
    address : {
        type : String,
        default :''
    },
    /* username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        required: true,
        type: String,

    }, */

  admin: {
    type: Boolean,
    default: false
  }
});

User.plugin(passportLocalMongoose); //added username and password ,hash ,salt ..

var Users = mongoose.model("User", User);

module.exports = Users;
