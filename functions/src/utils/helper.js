const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

exports.validatePhoneNumber = (phoneNumber) => {
  const regex = /^\d{10}$/; // regular expression to match a 10-digit phone number
  return regex.test(phoneNumber);
};

exports.checkPhoneNumberExists = (phoneNumber, sendData) => {
  console.log("checkPhoneNumberExists:", phoneNumber);
  admin
    .auth()
    .getUserByPhoneNumber(phoneNumber)
    .then((res) => {
      // console.log("phone number exists: ", res);
      sendData({
        status: "success",
        data: res,
      });
    })
    .catch((e) => {
      console.log("phone number doesn't exists: ", e.message);
      sendData({
        status: "failed",
        data: e.message,
      });
    });
};

exports.getDocument = (collectionId, docId, sendData) => {
  db.collection(collectionId)
    .doc(docId)
    .get()
    .then((doc) => {
      if (doc.exists) {
        const data = doc.data();
        sendData({
          status: "success",
          data,
        });
      } else {
        // document not found
        sendData({
          status: "failed",
          data: "doc not found",
        });
      }
    })
    .catch((e) => {
      // internal server error
      sendData({
        status: "server-error",
        data: e.message,
      });
    });
};
