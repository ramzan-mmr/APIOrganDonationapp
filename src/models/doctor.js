const mongoose = require("mongoose")

const doctorSchema = new mongoose.Schema({
    HopitalID: {
        type: String
    },
    Name: {
        type: String
    },
    Email:{
        type: String
    },
    PhoneNo: {
        type: String
    },
    Specialization:{
        type: String
    },
    Experience: {
        type: String
    }, 
    IsActive:{
        type: Boolean,
        default: true
    },
    CreatedON:{
        type:Date,
        default: Date.now
    }
})

const Doctor = new mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;