const admin = require('firebase-admin');
const { firebaseConfig } = require('./FirebaseConfig.js');
const serviceAccount = require('./ServiceAccount.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: firebaseConfig.storageBucket
});

const bucket = admin.storage().bucket();

module.exports = { bucket };