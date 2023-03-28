const express = require("express");
const multer = require("multer");
// const path = require("path");
const xlsx = require("xlsx");
const fs = require("fs");
const admin = require("firebase-admin");
const serviceAccount = require("../aelay-firebase-cred.json");

const app = express();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://aelay-dbd46-default-rtdb.firebaseio.com",
});

const db = admin.firestore();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    console.log(file);
    // cb(null, file.originalname + path.extname(file.originalname));
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

//Upload route
app.post("/upload", upload.single("salesReport"), async (req, res, next) => {
  try {
    console.log("inside post: ", req.file, req.body);
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    // const jsonData = xlsx.utils.sheet_to_json(sheet);
    const jsonData = xlsx.utils.sheet_to_json(sheet);
    console.log(
      "jsonData: ",
      jsonData[0],
      jsonData[1],
      jsonData[2],
      jsonData[3],
      jsonData[4]
    );

    //check format columns, whether it is correct, else return error
    const keys = Object.keys(jsonData[0]); // [OrderId, ISBN, etc..]

    const hasAllColumns =
      keys.includes("Order Channel") &&
      keys.includes("Order Date") &&
      keys.includes("Reference Order Number") &&
      keys.includes("Order Number") &&
      keys.includes("Publisher Name") &&
      keys.includes("Author Name") &&
      keys.includes("ISBN") &&
      keys.includes("Title") &&
      keys.includes("Pages") &&
      keys.includes("Book Size") &&
      keys.includes("Text Color") &&
      keys.includes("Binding") &&
      keys.includes("MRP") &&
      keys.includes("Total MRP") &&
      keys.includes("Quantity") &&
      keys.includes("POD Qty") &&
      keys.includes("Stock Qty");

    if (hasAllColumns) {
      const bookPromises = [];
      const getTxnPromises = [];
      const books = [];
      jsonData.forEach((record) => {
        console.log("record: ", record);
        if (record.ISBN) {
          // check record order id === transaction order id
          const transactionRef = db
            .collection("transactions")
            .doc(record["Order Number"])
            .get();
          const bookRef = db
            .collection("books")
            .where("ISBN", "==", record.ISBN)
            .get();
          // console.log("book: ", book.docs[0].data());
          bookPromises.push(bookRef);
          getTxnPromises.push(transactionRef);
        }
      });
      // filter transaction id with only new transactions, that should not be there in transactions collection
      const newTxnList = [];
      Promise.all(getTxnPromises)
        .then((result) => {
          result.forEach((txn) => {
            const txnData = txn.data();
            console.log("txn: ", txnData, txn.id);
            if (txnData === undefined) {
              const findItem = jsonData.find(
                (row) => txn.id === row["Order Number"]
              );
              newTxnList.push(findItem);
            }
          });
          console.log("new Txn List: ", newTxnList);
          const createTxnPromises = [];
          const updateWalletPromises = [];
          Promise.all(bookPromises)
            .then((result) => {
              // console.log("results: ", res[0].docs[0].data());
              // console.log("results: ", res.length, res[0].docs[0].data());
              result.forEach((val) => {
                val.docs.forEach((value) => {
                  // console.log("value: ", value.data());
                  books.push(value.data());
                });
                // console.log(val.docs.length);
              });
              console.log("books: ", books);
              newTxnList.forEach((record) => {
                const findItem = books.find(
                  (book) => book.ISBN === record.ISBN
                );
                if (findItem) {
                  console.log("itemFound: ", findItem, record);
                  const createTxnRef = db
                    .collection("transactions")
                    .doc(record["Order Number"])
                    .set({
                      ...record,
                      userId: findItem.uid,
                      totalRoyalty:
                        parseInt(record.Quantity) *
                        parseFloat(findItem.royalty),
                    });
                  createTxnPromises.push(createTxnRef);
                  const updateWalletRef = db
                    .collection("users")
                    .doc(findItem.uid)
                    .update({
                      totalEarnedRoyalty: admin.firestore.FieldValue.increment(
                        parseInt(record.Quantity) * parseFloat(findItem.royalty)
                      ),
                      currentWalletBalance:
                        admin.firestore.FieldValue.increment(
                          parseInt(record.Quantity) *
                            parseFloat(findItem.royalty)
                        ),
                    });
                  updateWalletPromises.push(updateWalletRef);
                }
              });

              Promise.all(createTxnPromises)
                .then((result1) => {
                  // console.log(result1);
                  Promise.all(updateWalletPromises)
                    .then((result2) => {
                      fs.unlink(req.file.path, (err) => {
                        if (err) throw err;
                        console.log(`${req.file.path} was deleted`);
                      });
                      res.json({
                        status: "success",
                        // data: jsonData[0],
                        data: "successfully stored details",
                        // data: book,
                      });
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            })
            .catch((e) => console.log(e));
        })
        .catch((e) => console.log(e));
    } else {
      res.json({
        status: "error",
        data: "incorrect excel report column names.",
      });
    }

    // return res.status(201).json({
    //   message: "File uploded successfully",
    // });
  } catch (error) {
    console.error(error);
  }
});

app.get("/", (req, res) => {
  res.status(200).send("Hello world");
});

app.listen(5001, () => {
  console.log("server listening on port::5001");
});
