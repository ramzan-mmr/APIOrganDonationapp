const express = require("express");
const User = require("../models/user");
const Donar = require("../models/donar");
const Hospital = require("../models/hospital");
const Doctor = require("../models/doctor");
const Organ = require("../models/organ");
const router = new express.Router();
const OrganListName = require("../models/OrganListName")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const validator = require('validator')
const multer = require('multer')
const cloudinary = require('../../helper/imageUpload');
const storage = multer.diskStorage({
    // destination: function (req, file, cb) {
    //     cb(null, "./uploads/");
    // },
    // filename: function (req, file, cb) {
    //     cb(null, file.originalname);
    // },
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb('Upload valid email', false);
    }
}
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
})
//Without the async 
// router.post("/Users", (req, res) => {
//     console.log(req.body);
//     const user = new User(req.body);
//     user.save().then(() => {
//         res.status(201).send(user);
//     }).catch((e) => {
//         res.status(400).send(e);
//     })
// });

//with asysc
//insert data using the postman
router.post("/Users", async (req, res) => {
    try {
        const user = new User(req.body);
        const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
        const validEmail = User.find({ Email: req.body.Email })
        if (!emailRegexp.test(user.Email)) {
            res.json({
                status: "FAILED",
                message: "Enter Valid gmail.",
            })
        }
        else if (validEmail >= 1) {
            res.json({
                status: "FAILED",
                message: "This user already register.",
            })
        }
        else if ((isNaN(user.Phone_No) || (user.Phone_No.length) > 11)) {
            res.json({
                status: "FAILED",
                message: "Please enter valid number",
            })
        }
        else {
            const createuser = await user.save();
            res.json({
                status: "SUCCESS",
                message: "SignUp Successfully",
                data: createuser,
            })
        }
    }
    catch (e) {
        res.status(400).send(e);
        res.json({
            status: "FAILED",
            message: "SignUp FAILED"
        })
    }
})

// geting data from the collection 
router.get("/Users", async (req, res) => {
    try {
        const data = await User.find();
        res.send(data);
    }
    catch (e) {
        res.send(e);
    }
})


// getting data from the collection using the ID 

router.get("/Users/:id", async (req, res) => {
    try {
        const _id = req.params.id;
        const studentData = await User.findById(_id);
        if (!studentData) {
            return res.status(404).send();
        }
        else {
            res.status(500).send(studentData);
        }
    }
    catch (e) {
        res.send(e);
    }
})

// updating the by ID
router.patch("/Users/:id", async (req, res) => {
    try {
        const _id = req.params.id;
        const studentData = await User.findByIdAndUpdate(_id, req.body, {
            new: true
        });
        res.send(updateUsers);
    }
    catch (e) {
        res.status(400).send(e);
    }
});

// Delete the User by id

router.delete("/Users/:id", async (req, res) => {
    try {
        const DeleteUser = await User.findByIdAndDelete(req.params.id);
        if (!req.params.id) {
            return res.status(400).send()
        }
        res.send(DeleteUser);
    } catch (e) {
        res.status(500).send(e);
    }
})

// Loign Authentication 

router.post("/Login", (req, res) => {
    User.find({ Email: req.body.Email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                res.json({
                    status: "FAILED",
                    message: "User Email Or Password is invalid"
                })
            }
            bcrypt.compare(req.body.Password, user[0].Password, (err, result) => {
                if (!result) {
                    res.json({
                        status: "FAILED",
                        message: "User Email Or Password is invalid"
                    })
                }
                else if (result) {
                    const token = jwt.sign({
                        _id: user[0]._id,
                        FirstName: user[0].FirstName,
                        LastName: user[0].LastName,
                        Gender: user[0].Gender,
                        IsActive: user[0].IsActive,
                        UserType: user[0].UserType
                    },
                        'this is Donate Me application data',
                        {
                            expiresIn: "24h"
                        }
                    );
                    const result = {
                        _id: user[0]._id,
                        FirstName: user[0].FirstName,
                        LastName: user[0].LastName,
                        Email: user[0].Email,
                        Phone_No: user[0].Phone_No,
                        Gender: user[0].Gender,
                        IsActive: user[0].IsActive,
                        UserType: user[0].UserType,
                        token: token
                    }
                    res.status(200).json({
                        status: "SUCCESS",
                        message: "User Login Successfully",
                        data: result,
                    });
                }
            })
        })
        .catch((error) => {
            res.status(500).json({
                error
            })
        })
})
//Donar Registration 
router.post("/Donars", async (req, res) => {
    console.log(req)
    try {
        const donar = new Donar(req.body);

        const createDonar = await donar.save();
        res.json({
            status: "SUCCESS",
            message: "Donar Registration Successfully...",
            data: createDonar,
        })

    }
    catch (e) {
        res.send(e);
        res.json({
            status: "FAILED",
            message: "Donar Registration FAILED..."
        })
    }
})

//Getting Data for user view 
router.post("/DonarsRecod", async (req, res) => {
    console.log(req.body.organName)
    try {
        Donar.find({ organ: req.body.organName })
            .then(result => {
                if (result.length < 1) {
                    res.status(401).json({
                        status: "FAILED",
                        message: "No Record found."
                    })
                }
                else {
                    res.status(200).json({
                        status: "SUCCESS",
                        message: "Record found.",
                        data: result,
                    });
                }
            })
    }
    catch (error) {
        console.log(error);
    }
})

// Hospital 


//Registration of new hospital
router.post("/hospital/addHospital", async (req, res) => {
    try {
        const hospital = new Hospital(req.body);
        const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
        const validEmail = Hospital.find({ Email: req.body.Email })
        if (!emailRegexp.test(hospital.Email)) {
            res.json({
                status: "FAILED",
                message: "Enter Valid Email.",
            })
        }
        else if (validEmail >= 1) {
            res.json({
                status: "FAILED",
                message: "This Hospital already register.",
            })
        }
        else if ((isNaN(hospital.HelpLine) || (hospital.HelpLine.length) > 11)) {
            res.json({
                status: "FAILED",
                message: "Please enter valid helpline number",
            })
        }
        else {
            const createHospital = await hospital.save();
            res.json({
                status: "SUCCESS",
                message: "Hospital Registration Successfully",
                data: createHospital,
            })
        }
    }
    catch (e) {
        res.status(400).send(e);
        res.json({
            status: "FAILED",
            message: "Registration FAILED"
        })
    }
})
//Get all Hospital record 
router.get("/hospital", async (req, res) => {
    try {
        const hospital = await Hospital.find();
        if (hospital.length >= 1) {
            res.json({
                status: "SUCCESS",
                message: "record found",
                data: hospital
            })
        }
        else {
            res.json({
                status: "FAILED",
                message: "No Record Found"
            })
        }
    }
    catch (e) {
        res.send(e);
    }
})

// Doctor 


//Registration of new Doctor 
router.post("/Doctor/addDoctor", async (req, res) => {
    try {
        const doctor = new Doctor(req.body);
        console.log(doctor)
        const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
        const validEmail = Doctor.find({ Email: req.body.Email })
        if (!emailRegexp.test(doctor.Email)) {
            res.json({
                status: "FAILED",
                message: "Enter Valid Email.",
            })
        }
        else if (validEmail >= 1) {
            res.json({
                status: "FAILED",
                message: "This Doctor already register.",
            })
        }
        else if ((isNaN(doctor.PhoneNo) || (doctor.PhoneNo.length) > 11 || (doctor.PhoneNo.length) < 11)) {
            res.json({
                status: "FAILED",
                message: "Please enter valid helpline number",
            })
        }
        else if (isNaN(doctor.Experience)) {
            res.json({
                status: "FAILED",
                message: "Please enter valid experience",
            })
        }
        else {
            const createDoctor = await doctor.save();
            res.json({
                status: "SUCCESS",
                message: "doctor Registration Successfully",
                data: createDoctor,
            })
        }
    }
    catch (e) {
        res.status(400).send(e);
        res.json({
            status: "FAILED",
            message: "Registration FAILED"
        })
    }
})

// Get all Doctor 
router.get("/DoctorAndHospital", async (req, res) => {
    try {
        const doctor = await Doctor.find();
        const hospital = await Hospital.find();
        const combineData = doctor.concat(hospital)
        if (doctor.length >= 1) {
            res.json({
                status: "SUCCESS",
                message: "record found",
                data: combineData
            })
        }
        else {
            res.json({
                status: "FAILED",
                message: "No Record Found"
            })
        }
    }
    catch (e) {
        res.send(e);
    }
})

// Saving new organ from admin 
router.post("/Organ", upload.single('avatar'), async (req, res, next) => {

    console.log(req.body.userID)
    try {
        const result = await cloudinary.uploader.upload(req.file.path, {
            public_id: `${req.body.userID}_avatar`,
            crop: 'fill'
        })
        const organ = new Organ({
            organName: req.body.organName,
            avatar: result.secure_url,
            isActive: req.body.isActive,
            userID: req.body.userID
        });
        const createOrgan = await organ.save();
        res.json({
            status: "SUCCESS",
            message: "doctor Registration Successfully",
            data: createOrgan,
        })
    }
    catch (e) {
        res.status(400).send(e);
        res.json({
            status: "FAILED",
            message: "Registration FAILED"
        })
    }
})

// Get all organ list for dashboard 
router.get("/Organ", async (req, res) => {
    try {
        const organ = await Organ.find();
        if (organ.length >= 1) {
            res.json({
                status: "SUCCESS",
                message: "record found",
                data: organ
            })
        }
        else {
            res.json({
                status: "FAILED",
                message: "No Record Found"
            })
        }
    }
    catch (e) {
        res.send(e);
    }
})

// Organ in names in dropdown
router.post("/newOrgan",async(req,res) =>{
    try {
        const organListName = new OrganListName(req.body);
     
            const createOrgan = await organListName.save();
            res.json({
                status: "SUCCESS",
                message: "Organ Register successfully",
                data: createOrgan,
            })
        }
    catch (e) {
        res.status(400).send(e);
        res.json({
            status: "FAILED",
            message: "Registration FAILED"
        })
    }
})

//Gett all Organ name for dropdown
router.get("/dropdownOrgan", async (req, res) => {
    try {
        const organlistname = await OrganListName.find();
        if (organlistname.length >= 1) {
            res.json({
                status: "SUCCESS",
                message: "record found",
                data: organlistname
            })
        }
        else {
            res.json({
                status: "FAILED",
                message: "No Record Found"
            })
        }
    }
    catch (e) {
        res.send(e);
    }
})

module.exports = router;