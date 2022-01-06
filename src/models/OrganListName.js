const mongoose = require('mongoose');
const bcrypt = require ('bcryptjs')

const organListNameSchema = new mongoose.Schema({
    organName: {
        type: String,
        required: true,
    },
    CreatedON:{
        type:Date,
        default: Date.now
    }
});


// we will create the new collection here
const OrganListName = new mongoose.model('OrganListName',organListNameSchema);

module.exports = OrganListName;

