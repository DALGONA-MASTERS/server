const { initializeApp } = require("firebase/app");
const { firebaseConfig } = require("../config/FirebaseConfig");
const {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} = require("firebase/storage");

// firebase storage initializing
initializeApp(firebaseConfig);
const storage = getStorage();

// Function to upload file to Firebase Storage
exports.uploadPicture = async (file) => {
  const uniqueSuffix = Date.now() + "_" + Math.round(Math.random());
  const storageRef = ref(
    storage,
    `files/${file.originalname + "__" + uniqueSuffix}`
  );

  const metadata = {
    contentType: file.mimetype,
  };
  // upload the file in the bucket storage
  const snapshot = await uploadBytesResumable(
    storageRef,
    file.buffer,
    metadata
  );
  const uploadUrl = await getDownloadURL(snapshot.ref);
  return uploadUrl;
};
