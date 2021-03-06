const { response, Router } = require("express");
const express = require("express");
require("./dbConnection/conn.js");
const userRouter = require("./Routers/userRouter");
const {createProxyMiddleware} = require("http-proxy-middleware")
const app = express();
const port = process.env.PORT || 8000;

//Insert data in user collection and getting from API and
app.use(express.json());
app.use('/uploads', express.static('uploads'));
// 3: we need to register our router 
app.use(userRouter);
app.listen(port, () => {
    console.log(`connection is setup at ${port}`);
});

