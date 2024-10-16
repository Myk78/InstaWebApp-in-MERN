var express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
var dotenv = require("dotenv");
dotenv.config({});

var app = express();
var db = require("./config/mongoose-connect");
// import db from "./config/mongoose-connect.js";
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const CorsOptions = {
  origin: "http://localhost:5173",
  Credential: true,
};
app.use(cors(CorsOptions));
app.get("/", (req, res) => {
  return res.status(200).json({
    message: "i am coming from backend",
    success: true,
  });
});

module.exports = app;
