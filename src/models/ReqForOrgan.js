const mongoose = require('mongoose');

const validator = require('validator');

const ReqForOrganSchema = new mongoose.Schema({
    PatName:{
        type:String,
        required:true,
    },
    PatDecease:{
        type:String,
        required:true,
    },
    PatCnic:{
        type:Number,
        required: true
    },
    PatDOB:{
        type: Date,
        required: true,
    },
    PatRequired:{
        type:String,
        required:true,
    },
    HosId:{
        type: String,
        required: true,
    },
    // HosName:{
    //     type: String,
    //     required: true,
    // },
    // HosLocation:{
    //     type: String,
    //     required:true
    // },
    Description:{
        type: String,
        required: true,
    } ,
    Age:{
        type: String,
    },
    isActive:{
        type:Boolean,
        default: true
    },
    Status:{
        type:String,
        default: "Requested"
    },
    CreatedON:{
        type:Date,
        default: Date.now
    }
});
const ReqForOrgan = new mongoose.model('ReqForOrgan',ReqForOrganSchema);

module.exports = ReqForOrgan;