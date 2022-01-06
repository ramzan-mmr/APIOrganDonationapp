const express = require("express");
const Donar = require("../models/donar");
const router= new express.Router();

//insert data using the postman
router.post("/Donars", async (req, res) => {
    try {
        const donar = new Donar(req.body);
        
        const createDonar = await donar.save();
        res.json({
            status: "SUCCESS",
            message: "SignUp Successfully",
            data: createDonar,
        })

    }
    catch (e) {
        res.status(400).send(e);
        res.json({
            status: "FAILED",
            message: "SignUp FAILED"
        })
    }
})

module.exports = router;
