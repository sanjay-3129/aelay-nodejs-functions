const functions = require("firebase-functions");
const express = require("express");

const {
  checkPhoneNumberExists,
  validatePhoneNumber,
  getDocument,
} = require("./utils/helper");

const app = express();

app.get("/", (req, res) => {
  // console.log("phone: ", req.query.phoneNumber);
  const phoneNumber = `+${req.query.phoneNumber}`;
  if (!phoneNumber) {
    // if (!phoneNumber && !validatePhoneNumber(phoneNumber)) {
    res.status(400).json({
      status: "failed",
      message: "phone number is invalid",
      data: `invalid: ${phoneNumber}`,
    });
  } else {
    // console.log("entered else...");
    checkPhoneNumberExists(phoneNumber, (result) => {
      // console.log("resLL: ", result);
      if (result.status === "success") {
        getDocument("users", result.data.uid, (isDoc) => {
          if (isDoc.status === "success") {
            res.status(200).json({
              status: "success",
              message: isDoc.data,
              data: { phoneNumberExists: true, profileExists: true },
            });
          } else if (isDoc.status === "failed") {
            res.status(200).json({
              status: "success",
              message: isDoc.data,
              data: { phoneNumberExists: true, profileExists: false },
            });
          } else {
            res.status(500).json({
              status: isDoc.status,
              message: isDoc.data,
              data: { phoneNumberExists: true, profileExists: false },
            });
          }
        });
        // should add one more scenario
      } else {
        res.status(400).json({
          status: "failed",
          message: result.data,
          data: { phoneNumberExists: false, profileExists: false },
        });
      }
    });
  }
});

exports.accountExist = functions.https.onRequest(app);
