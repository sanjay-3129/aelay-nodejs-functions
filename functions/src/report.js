const functions = require("firebase-functions");
const express = require("express");
const multer = require("multer");
const path = require("path");
const os = require("os");
const xlsx = require("xlsx");
const fs = require("fs");

const app = express();

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, os.tmpdir());
//   },
//   filename: (req, file, cb) => {
//     console.log("filename: ", file, file.originalname);
//     // cb(null, file.originalname + path.extname(file.originalname));
//     cb(null, file.originalname);
//   },
// });

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "/tmp");
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.originalname);
//   },
// });

const storage = multer.memoryStorage({
  destination: function (req, file, cb) {
    cb(null, "/tmp");
  },
  filename: function (req, file, cb) {
    // Set the custom filename for the uploaded file
    callback(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/vnd.ms-excel") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only Excel files are allowed!"));
    }
  },
});

app.post("/upload", upload.single("salesReport"), (req, res, next) => {
  try {
    console.log("inside post: ", req.file, req.body);
    // const workbook = xlsx.readFile(req.file.path);
    // const sheet = workbook.Sheets[workbook.SheetNames[0]];
    // // const jsonData = xlsx.utils.sheet_to_json(sheet);
    // const jsonData = xlsx.utils.sheet_to_json(sheet);
    // console.log("jsonData: ", jsonData[0]);
    // fs.unlink(req.file.path, (err) => {
    //   if (err) throw err;
    //   console.log(`${req.file.path} was deleted`);
    // });
    res.json({
      status: "success",
      data: req.file,
    });
    // return res.status(201).json({
    //   message: "File uploded successfully",
    // });
  } catch (error) {
    console.error(error);
  }
});

exports.report = functions.https.onRequest(app);
