// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const multer = require("multer");
// const upload = multer();

// const functions = require("firebase-functions");
const { getPageCount } = require("./src/pageCount");
const { accountExist } = require("./src/accountExist");
const { salesReport } = require("./src/salesReport");
const { report } = require("./src/report");

// const app = express();

// // Automatically allow cross-origin requests
// app.use(cors({ origin: true }));
// app.use(bodyParser.urlencoded({ extended: true }));

// // parse application/json
// app.use(bodyParser.json());

// Add middleware to authenticate requests
// app.use(myMiddleware);

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//

// app.get("/", (req, res) =>
//   res.status(200).json({
//     status: "success",
//   })
// );

// app.post("/", (req, res) => getPageCount(req, res));

// exports.pageCount = functions.https.onRequest(app);
exports.pageCount = getPageCount;

exports.accountExist = accountExist;

exports.salesReport = salesReport;

exports.report = report;

// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", { structuredData: true });
//   response.send("Hello from Firebase!");
// });

/*
firebase init functions

npm run serve

firebase deploy --only functions
*/
