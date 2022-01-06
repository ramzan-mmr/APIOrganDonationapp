
const mongoose = require("mongoose")
const DB = "mongodb+srv://ramzan:ramzan12345@cluster0.8okzv.mongodb.net/test"
//const DB = "mongodb://localhost:27017"
mongoose.connect(DB).then(() => {
    console.log("connection is sucessful..")
}).catch((e)=>{
    console.log(e);
    console.log("connectin is not build...");
});