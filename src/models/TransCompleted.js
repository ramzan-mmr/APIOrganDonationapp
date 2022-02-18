const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

const TransSchema = new mongoose.Schema({
    HospId: {
        type: String,
        required: true,
    },
    donarID: {
        type: String,
        default: false
    },
    RequestID: {
        type: String,
        default:true
    },
    CreatedON: {
        type: Date,
        default: Date.now
    },
    Status:{
        type:String,
    },
    IsActive: {
        type: Boolean,
        default: true
    }
});



// we will create the new collection here
const TransCompleted = new mongoose.model('TransCompleted', TransSchema);

module.exports = TransCompleted;

