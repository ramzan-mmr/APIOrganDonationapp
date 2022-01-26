const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

const PortalUserSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true,
    },
    UserName: {
        type: String,
        required: true,
    },
    Password: {
        type: String,
        required: true,
    },
    IsActive: {
        type: Boolean,
        required: true,
        default:true
    },
    CreatedON: {
        type: Date,
        default: Date.now
    },
    Role: {
        type: String,
        required: true,
    },
});

PortalUserSchema.pre('save', async function (next) {
    if (!this.isModified('Password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.Password, salt);

    this.Password = hash;
    next();
});


// we will create the new collection here
const PortalUser = new mongoose.model('PortalUser', PortalUserSchema);

module.exports = PortalUser;

