const mongoose = require('mongoose');
const bcrypt = require ('bcryptjs')

const userSchema = new mongoose.Schema({
    FirstName: {
        type: String,
        required: true,
    },
    LastName: {
        type: String,
        required: true,
    },
    Email: {
        type : String,
        required : true,
    },
    Phone_No: {
        type: String,
        required: true,
    },
    Gender: {
        type: String,
        required: true,
    },
    Password: {
        type: String,
        required: true,
    },
    IsActive: {
        type: Boolean,
        required: true
    },
    UserType:{
        type:String,
        required:true,
    },
    CreatedON:{
        type:Date,
        default: Date.now
    }
});

    userSchema.pre('save', async function (next) {
        if (!this.isModified('Password')) {
            return next();
          }
        
          const salt = await bcrypt.genSalt(10);
          const hash = await bcrypt.hash(this.Password, salt);
        
          this.Password = hash;
          next();
    });


// we will create the new collection here
const User = new mongoose.model('User',userSchema);

module.exports = User;

