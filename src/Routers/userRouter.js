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
const jwt_decode = require('jwt-decode');
const validator = require('validator')
const multer = require('multer')
const cloudinary = require('../../helper/imageUpload');
const cors = require('cors');
const PortalUser = require("../models/PortalUser");
const ReqForOrgan = require("../models/ReqForOrgan");
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
        if (data.length >= 1) {
            res.json({
                status: "SUCCESS",
                message: "record found",
                data: data
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

router.delete("/Users/:id", varifyToken, async (req, res) => {
    const DeleteUser = await User.findByIdAndDelete(req.params.id);
    try {
        jwt.verify(req.token, 'mian12345', (err, authData) => {
            if (err) {
                res.sendStatus(403);
            }
            else {
                res.json({
                    status: "SUCCESS",
                    message: "User Delete successfully",
                    // data: DeleteHospital
                })
            }
        })
    } catch (e) {
        res.status(500).send(e);
    }
})

// Loign Authentication 

router.post("/Login", cors(), (req, res) => {
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
                        'mian12345',
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
    const findDonar = await Donar.find({
        donarID: req.body.donarID
    });
    console.log(findDonar.length)
    if (findDonar.length < 1) {
        createDonar();
    }
    else {
        res.json({
            status: "FAILED",
            message: "You are already register as donar"
        })
    }
    async function createDonar() {
        const donar = new Donar(req.body)
        const createDonar = await donar.save()
        if (!createDonar) {
            res.json({
                status: "FAILED",
                message: "Donar register Failed..."
            })
        }
        else {
            res.json({
                status: "SUCCESS",
                message: "Donar register successfully...",
                data: createDonar
            })
        }
    }
})
//Donar data for Profile
router.get("/GetDonarData/:id", async (req, res) => {
    try {
        const donarID = req.params.id;
        const Data = await Donar.find({ donarID: donarID });
        console.log(Data)
        if (Data.length > 0) {
            res.json({
                status: "SUCCESS",
                message: "Record Found",
                data: Data
            })
        }
        else {
            res.json({
                status: "FAILED",
                message: "Record Not Found",
            }) 
        }
    }
    catch (e) {
        res.send(e);
    }
})
//Get All Donars
router.get("/Donars", async (req, res) => {
    try {
        const donars = await Donar.find();
        if (donars.length >= 1) {
            res.json({
                status: "SUCCESS",
                message: "record found",
                data: donars
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
//Delete Donars
router.delete("/Donars/:id", varifyToken, async (req, res) => {
    const DeleteDonars = await Donar.findByIdAndDelete(req.params.id);
    try {
        jwt.verify(req.token, 'mian12345', (err, authData) => {
            if (err) {
                res.sendStatus(403);
            }
            else {
                res.json({
                    status: "SUCCESS",
                    message: "Donar Delete successfully",
                    // data: DeleteHospital
                })
            }
        })
    } catch (e) {
        res.status(500).send(e);
    }
})
//Editing Donars
router.post("/donarEdit", varifyToken, async (req, res) => {
    jwt.verify(req.token, 'mian12345', (err, authData) => {
        if (err) {
            res.sendStatus(403);
        }
        else {
            editDonar();
        }
    })
    async function editDonar() {
        const EditDonars = await Donar.findByIdAndUpdate(req.body._id, {
            name: req.body.name,
            cnic: req.body.cnic,
            dateOfBirth: req.body.dateOfBirth,
            organ: req.body.organ,
            phoneNo: req.body.phoneNo,
            address: req.body.address
        }, { new: true })
            .then(EditDonars => {
                if (!EditDonars) {
                    res.json({
                        status: "FAILED",
                        message: "Not found with this ID",
                    })
                }
                else {
                    res.json({
                        status: "SUCCESS",
                        message: "Donar Edit successfully",
                    })
                }
            })
            .catch(err => {
                return res.status(500).send({
                    message: "Error updating note with id " + req.body._id
                });
            })
    }
})
//Getting Data for user view 
router.post("/DonarsRecod", async (req, res) => {
    console.log(req.body.organName)
    try {
        ReqForOrgan.find({ PatRequired: req.body.organName })
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
        const user = new PortalUser({
            Name: req.body.Name,
            UserName: req.body.UserName,
            Password: req.body.Password,
            Role: req.body.Role
        });
        console.log(user)
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
            const createPortalUser = await user.save();
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
//Delete hospital
router.delete("/hospital/:id", varifyToken, async (req, res) => {
    const DeleteHospital = await Hospital.findByIdAndDelete(req.params.id);
    try {
        jwt.verify(req.token, 'mian12345', (err, authData) => {
            if (err) {
                res.sendStatus(403);
            }
            else {
                res.json({
                    status: "SUCCESS",
                    message: "Hospital Delete successfully",
                    data: DeleteHospital
                })
            }
        })
    } catch (e) {
        res.status(500).send(e);
    }
})
//Edit Hospital 
router.post("/hospitalEdit", varifyToken, async (req, res) => {
    jwt.verify(req.token, 'mian12345', (err, authData) => {
        if (err) {
            res.sendStatus(403);
        }
        else {
            editHospital();
        }
    })
    async function editHospital() {
        const EditHospital = await Hospital.findByIdAndUpdate(req.body._id, {
            Name: req.body.Name,
            Email: req.body.Email,
            Location: req.body.Location,
            HelpLine: req.body.HelpLine,
            HospDis: req.body.HospDis
        }, { new: true })
            .then(EditHospital => {
                if (!EditHospital) {
                    res.json({
                        status: "FAILED",
                        message: "Not found with this ID",
                    })
                }
                else {
                    res.json({
                        status: "SUCCESS",
                        message: "Hospital Edit successfully",
                    })
                }
            })
            .catch(err => {
                return res.status(500).send({
                    message: "Error updating note with id " + req.body._id
                });
            })
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
router.post("/Organ", upload.single('avatar'), async (req, res) => {
    console.log(req)
    try {
        const file = req.file.path  
        const result = await cloudinary.uploader.upload(file)
        const organ = new Organ({
            organName: req.body.organName,
            avatar: result.secure_url,
            isActive: req.body.isActive,
            userID: req.body.userID 
        });
        const organListName = new OrganListName({
            organName: req.body.organName
        })
        const createOrgan = await organ.save();
        const createOrganListName = await organListName.save();
        if (!result) {
            res.json({
                status: "FAILED",
                message: "Not found with this ID",
            })
        }
        else {
            res.json({
                status: "SUCCESS",
                message: "Organ Registration Successfully",
                data: createOrgan,
            })
        }
    } catch (error) {
        console.log(error)
        res.json({
            status: "FAILED",
            message: "Ofasdfaklsdfja;klsdjf;klajsd;fkl",
            data: error,
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
router.get("/OrganForApplication", async (req, res) => {
    try {
        const organ = await ReqForOrgan.find();
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
router.post("/newOrgan", async (req, res) => {
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

//Delete Organ by ID
router.delete("/Organ/:id", varifyToken, async (req, res) => {
    const DeleteOrgan = await Organ.findByIdAndDelete(req.params.id);
    try {
        jwt.verify(req.token, 'mian12345', (err, authData) => {
            if (err) {
                res.sendStatus(403);
            }
            else {
                res.json({
                    status: "SUCCESS",
                    message: "Organ Delete successfully",
                    // data: DeleteOrgan
                })
            }
        })
    } catch (e) {
        res.status(500).send(e);
    }
})

// Admin Login APi start here 
//Login API
router.post("/portalLogin", async (req, res) => {
    PortalUser.find({ UserName: req.body.UserName })
        .exec()
        .then(PortalUser => {
            if (PortalUser.length < 1) {
                res.json({
                    status: "FAILED",
                    message: "UserName Or Password is invalid"
                })
            }
            bcrypt.compare(req.body.Password, PortalUser[0].Password, (err, result) => {
                if (!result) {
                    res.json({
                        status: "FAILED",
                        message: "UserName Or Password is invalid"
                    })
                }
                else if (result) {
                    const token = jwt.sign({
                        _id: PortalUser[0]._id,
                        Name: PortalUser[0].Name,
                        UserName: PortalUser[0].UserName,
                        CreatedON: PortalUser[0].CreatedON,
                        Role: PortalUser[0].Role,
                        IsActive: PortalUser[0].IsActive,
                    },
                        'mian12345',
                        {
                            expiresIn: "24h"
                        }
                    );
                    const result = {
                        _id: PortalUser[0]._id,
                        Name: PortalUser[0].Name,
                        UserName: PortalUser[0].UserName,
                        IsActive: PortalUser[0].IsActive,
                        CreatedON: PortalUser[0].CreatedON,
                        Role: PortalUser[0].Role,
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
//Add New user in Portal 
router.post("/addportalUser", varifyToken4, async (req, res) => {
    const user = new PortalUser(req.body);
    const validUserName = await PortalUser.find({ UserName: req.body.UserName })
    const createuser = await user.save();
    jwt.verify(req.token, 'mian12345', (err, authData) => {
        if (err) {
            res.sendStatus(403);
        }
        else {
            if (validUserName.length > 0) {
                res.json({
                    status: "FAILED",
                    message: "This user already register.",
                })
            }
            else {
                if (createuser) {
                    res.json({
                        status: "SUCCESS",
                        message: "New User register Successfully",
                        data: createuser,
                    })
                }
                else {
                    res.json({
                        status: "FAILED",
                        message: "New User register FAILED",
                    })
                }
            }
        }
    })
})
//Get all user in portal
router.get("/portaluser", async (req, res) => {
    try {
        const portalUser = await PortalUser.find();
        if (portalUser.length >= 1) {
            res.json({
                status: "SUCCESS",
                message: "record found",
                data: portalUser
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
//End here

//Request for organ
router.post("/Request", varifyToken2, async (req, res) => {
    try {
        const current = new Date();
        const limit = await ReqForOrgan.find(req.body.CreatedON,{
            CreatedON:current
        })
        jwt.verify(req.token, 'mian12345', (err, authData) => {
            if (err) {
                res.sendStatus(403);
            }
            else if(limit.length > 2){
                res.json({
                    status: "FAILED",
                    message: "You exceeded today limit..."
                })
            }
            else {
                 SavaData(); 
            }
        })
    }
    catch (e) {
        res.status(400).send(e);
        res.json({
            status: "FAILED",
            message: "SignUp FAILED"
        })
    }
    async function SavaData(){
        const request = new ReqForOrgan(req.body);
        const creatRequest = await request.save();
        if (creatRequest) {
            res.json({
                status: "SUCCESS",
                message: "Registration Successfully",
            })
        }
        else {
            res.json({
                status: "FAILED",
                message: "registration Failed",
            })
        }
    }
})
// Get All request by hospital ID hospital and admin
router.get("/Request/:id", async (req, res) => {
    try {
        const HosId = req.params.id;
        const Data = await ReqForOrgan.find({ HosId: HosId });
        if (!Data) {
            return res.status(404).send();
        }
        else {
            res.json({
                status: "SUCCESS",
                message: "Record Found",
                data: Data
            })
        }
    }
    catch (e) {
        res.send(e);
    }
})
//Delete the request hospital and admin
router.delete("/RequestDelete/:id", varifyToken3, async (req, res) => {
    const DeleteRequest = await ReqForOrgan.findByIdAndDelete(req.params.id);
    try {
        jwt.verify(req.token, 'mian12345', (err, authData) => {
            if (err) {
                res.sendStatus(403);
            }
            else {
                if (DeleteRequest) {
                    res.json({
                        status: "SUCCESS",
                        message: "Request Delete successfully",
                    })
                }
                else {
                    res.json({
                        status: "FAILED",
                        message: "Request Delete FAILED",
                    })
                }
            }
        })
    } catch (e) {
        res.status(500).send(e);
    }
})
//Edit the request by hospital and admin 
router.post("/RequestEdit/:id", varifyToken3, async (req, res) => {
    jwt.verify(req.token, 'mian12345', (err, authData) => {
        if (err) {
            res.sendStatus(403);
        }
        else {
            ReqForOrgan.findByIdAndUpdate(req.params.id, req.body, (err, emp) => {
                if (err) {
                    res.json({
                        status: "FAILED",
                        message: "Problem with Updating the record "
                    })
                };
                res.json({
                    status: "SUCCESS",
                    message: "Record Updated successfully"
                })
            })
        }
    })
})
router.get("/allRequest", varifyToken, async (req, res) => {
    const result = await ReqForOrgan.find()
    jwt.verify(req.token, 'mian12345', (err, authData) => {
        if (err) {
            res.sendStatus(403);
        }
        else {
            if (result.length >= 1) {
                res.json({
                    status: "SUCCESS",
                    message: "record found",
                    data: result
                })
            }
            else {
                res.json({
                    status: "FAILED",
                    message: "No Record Found"
                })
            }
        }
    })
})
// Fetch the Matched result
router.post("/matchedData", varifyToken3, async (req, res) => {
    const result = await Donar.find({
        Age: req.body.Age,
        organ: req.body.organ
    })
    console.log(result)
    jwt.verify(req.token, 'mian12345', (err, authData) => {
        if (err) {
            res.sendStatus(403);
        }
        else {
            res.json({
                status: "SUCCESS",
                message: "Record Found",
                data: result,
                count: result.length
            })
        }
    })
})
//Selected User API
router.post("/selectDonar", varifyToken2, async (req, res) => {
    jwt.verify(req.token, 'mian12345', (err, authData) => {
        if (err) {
            res.sendStatus(403);
        }
        else {
            updateDonar();
        }
    })
    async function updateDonar() {
        const result = await Donar.findByIdAndUpdate(req.body._id, {
            IsSelect: true
        })
        if (result) {
            res.json({
                status: "SUCCESS",
                message: "Donar Selected Successfully"
            })
        }
        else {
            res.json({
                status: "FAILED",
                message: "Not Selected",
            })
        }
    }
})
router.post("/donarTransPlantcomp", varifyToken2, async (req, res) => {
    jwt.verify(req.token, 'mian12345', (err, authData) => {
        if (err) {
            res.sendStatus(403);
        }
        else {
            updateData();
        }
    })
    async function updateData() {
        const result = await Donar.findByIdAndUpdate(req.body.donarID, {
            IsActive: false
        })
        const result2 = await ReqForOrgan.findByIdAndUpdate(req.body.RequestID, {
            isActive: false,
            Status: req.body.Status
        })
        if (result && result2) {
            res.json({
                status: "SUCCESS",
                message: "Complete",
            })
        }
        else {
            res.json({
                status: "FAILED",
                message: "Not Complete",
            })
        }
    }
})
//varifyToken
function varifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    }
    else {
        res.sendStatus(403)
    }
}
//verify token request for new organ
function varifyToken2(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    const userDecode = jwt_decode(bearerHeader)
    if (userDecode.Role === "Hospital") {
        if (typeof bearerHeader !== 'undefined') {
            const bearer = bearerHeader.split(' ');
            const bearerToken = bearer[1];
            req.token = bearerToken;
            next();
        }
        else {
            res.sendStatus(403)
        }
    }
    else {
        res.sendStatus(403)
    }
}
function varifyToken3(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    const userDecode = jwt_decode(bearerHeader)
    if (userDecode.Role === "Admin") {
        if (typeof bearerHeader !== 'undefined') {
            const bearer = bearerHeader.split(' ');
            const bearerToken = bearer[1];
            req.token = bearerToken;
            next();
        }
        else {
            res.sendStatus(403)
        }
    }
    else if (userDecode.Role === "Hospital") {
        if (typeof bearerHeader !== 'undefined') {
            const bearer = bearerHeader.split(' ');
            const bearerToken = bearer[1];
            req.token = bearerToken;
            next();
        }
        else {
            res.sendStatus(403)
        }
    }
    else {
        res.sendStatus(403)
    }
}
function varifyToken4(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    const userDecode = jwt_decode(bearerHeader)
    if (userDecode.Role === "Admin") {
        if (typeof bearerHeader !== 'undefined') {
            const bearer = bearerHeader.split(' ');
            const bearerToken = bearer[1];
            req.token = bearerToken;
            next();
        }
        else {
            res.sendStatus(403)
        }
    }
    else {
        res.sendStatus(403)
    }
}
module.exports = router;