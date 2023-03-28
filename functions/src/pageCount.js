const functions = require("firebase-functions");
const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");
const pageCount = require("page-count");

const app = express();

app.post("/", (req, res) => {
  // res.send("thanks");
  // console.log("req.file: ", req.file);
  console.log("req.body: ", req.body);
  const pdfFile = req.body;

  // Get the page count of the PDF file
  pageCount.PdfCounter.count(pdfFile)
    .then((count) => {
      res.status(200).json({
        status: "success",
        message: `The PDF file has ${count} pages.`,
        data: count,
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(400).json({
        status: "failed",
        message: "Failed to get the page count of the PDF file.",
        data: error.message,
      });
    });
});

exports.getPageCount = functions.https.onRequest(app);
