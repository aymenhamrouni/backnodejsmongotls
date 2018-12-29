var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var values = new Schema({
    id : {
        type : String,
        required : true
    },
    temp : {
        type : String,
        default : 'Not available'
    },
    dioxide : {
        type : String,
        default : 'Not available'
    },
    monoxide : {
        type : String,
        default : 'Not available'
    },
    windows : {
        type : String,
        default : 'Not available'
    },
    doors : {
        type : String,
        default : 'Not available'
    }
});


var values = mongoose.model("Values", values);

module.exports = values;
