const functions = require("firebase-functions");
const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");
const xlsx = require("xlsx");
const fs = require("fs");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    console.log("file: ", file);
    // cb(null, file.originalname + path.extname(file.originalname));
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

const app = express();

// app.use(cors({ origin: true }));
// app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
// app.use(bodyParser.json());

app.post("/", upload.single("salesReport"), (req, res) => {
  try {
    console.log("inside salesReport: ", req.file, req.body);
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
      // data: jsonData[0],
      data: req.file,
    });
    // return res.status(201).json({
    //   message: "File uploded successfully",
    // });
  } catch (error) {
    console.error(error);
    res.json({
      status: "failed",
      data: error.message,
    });
  }
});

exports.salesReport = functions.https.onRequest(app);
