// Import the functions you need from the SDKs you need

const firebaseConfig = {
    apiKey: `${process.env.APIKEY}`,
    authDomain: `${process.env.AUTHDOMAIN}`,
    projectId: `${process.env.PROJECTID}`,
    storageBucket: `${process.env.STORAGEBUCKET}`,
    messagingSenderId: `${process.env.MESSAGINGSENDERID}`,
    appId: `${process.env.APPID}`,
    measurementId: `${process.env.MEASUREMENTID}`,
  };
  
  // Initialize Firebase
  
  module.exports = { firebaseConfig };
  