const bcrypt = require("bcrypt");
const { Schema, model } = require("mongoose");
const { isEmail } = require("validator");

const userSchema = new Schema({
  username: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    validate: [isEmail],
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePic: {
    type: String,
  },
  fullName: {
    type: String,
  },
  bio: {
    type: String,
  },
  liked: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
<<<<<<< HEAD
  events: [
=======
  Events: [
>>>>>>> a4499a909691ed513a890b7c7cae34ee18bdb0f2
    {
      type: Schema.Types.ObjectId,
      ref: "Event",
    },
  ],
});

// middleware to hash passwords before saving to db
userSchema.pre("save", async function (next) {
  const user = this;

  user.password = await bcrypt.hash(user.password, 10);

  next();
});
// adding login method
userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("incorrect password");
  }
  throw Error("incorrect email");
};

module.exports = model("User", userSchema);
