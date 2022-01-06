const mongoose = require("mongoose")

const hospitalSchema = new mongoose.Schema({
    Name:{
        type: String,
    },
    Email: {
        type: String
    },
    Location: {
        type: String
    },
    HelpLine: {
        type: String
    },
    HospDis:{
        type: String,
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
const Hospital = new mongoose.model('Hospital', hospitalSchema);

module.exports = Hospital;


