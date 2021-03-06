const mongoose = require('mongoose');

const validator = require('validator');

const donarSchema = new mongoose.Schema({
    donarID:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    cnic:{
        type:Number,
        required: true
    },
    dateOfBirth:{
        type: Date,
        required: true,
    },
    organ:{
        type:String,
        required:true,
    },
    phoneNo:{
        type: Number,
        required: true,
    },
    address:{
        type: String,
        required: true,
    },
    description:{
        type: String,
    },
    state:{
        type:String,
        required:true,
        default:"Pakistan"
    },
    Age:{
        type:String
    },
    IsActive:{
        type: Boolean,
        default: true
    },
    IsSelect:{
        type: Boolean,
        default: false
    },
    IsSelectedByHospital:{
        type:String
    },
    RequestID:{
        type:String
    },
    CreatedON:{
        type:Date,
        default: Date.now
    }
});
const Donar = new mongoose.model('Donar',donarSchema);

module.exports = Donar;