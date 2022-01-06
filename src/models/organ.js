const mongoose = require('mongoose');

const organSchema = new mongoose.Schema({
    organName:{
        type: String,
        required: true
    },
    avatar:{
        type: String,
        required: true
    },
    userID:{
      type: String,
      required: true  
    },
    isActive:{
        type: Boolean,
        required: true
    },
    CreatedON:{
        type:Date,
        default: Date.now
    }
})
const Organ = new mongoose.model('Organ',organSchema);

module.exports = Organ;