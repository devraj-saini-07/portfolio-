const functions = require("firebase-functions");

const admin = require("firebase-admin");

admin.initializeApp();

exports.sendLeakAlert = functions.database
.ref("/users/user1/leakage")
.onUpdate(async (change, context) => {

  const after = change.after.val();

  if(after === true){

    const snapshot = await admin.database()
    .ref("/users/user1/token")
    .once("value");

    const token = snapshot.val();

    const message = {

      notification: {

        title: "Water Leakage Alert",

        body: "Water leakage detected!"

      },

      token: token

    };

    await admin.messaging().send(message);

    console.log("Notification Sent");

  }

});