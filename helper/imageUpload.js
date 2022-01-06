const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
       cloud_name: "donateme" , 
       api_key: "576294757281725" , 
       api_secret: "zznU4WpPRoubiwucRbauxNPidas" ,
     });
module.exports = cloudinary;