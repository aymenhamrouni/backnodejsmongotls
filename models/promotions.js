const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency=mongoose.Types.Currency;

const promotionsSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    image : {
        type : String,
        require : true
    },
    label : {
        type : String,
        default : ''
    },
    price : {
        type : Currency,
        require : true,
        min: 0
    },
    featured : {
        type : Boolean,
        default : false

    }
},{
    timestamps: true
});

var Promotions = mongoose.model('Promotion', promotionsSchema);

module.exports = Promotions;