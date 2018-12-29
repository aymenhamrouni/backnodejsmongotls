const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');


const HomeSchema = new Schema({
    homeId: {
        type: String,
        required: true,
        unique: true
    },
    Temp: {
        type: String,
        required: true
    } ,
    WindowsSensors : {
        type : Boolean,
        require : true
    },
    DoorsSensors : {
        type : Boolean,
        require : true
    },
    CarbonMonoxide : {
        type : String,
        required : true
        }
        ,
    CarbonDioxide : {
        type : String,
        required : true
        }
}, {
    timestamps: true
});

//var Home = mongoose.model('Home', HomeSchema);
HomeSchema.plugin(uniqueValidator);

const Identity = mongoose.model('Home', HomeSchema);


exports.createIdentity = (userData) => {
    const user = new Identity(userData);
    return user.save();
};

exports.putIdentity = (id,identityData) => {
    return new Promise((resolve, reject) => {
        Identity.findByIdAndUpdate(id,identityData,function (err,user) {
            if (err) reject(err);
            resolve(user);
        });
    });
};

exports.findByHomeId = (homeId) => {
    return Identity.findOne({homeId: homeId});
};