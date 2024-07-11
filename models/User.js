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
  events: [
    {
      type: Schema.Types.ObjectId,
      ref: "Event",
    },
  ],
  googleId: {
    type: String,
  },
  deactivated: {
    type: Boolean,
    default: false
  }
});

// adding login method
userSchema.statics.login = async function(email, password) {
  const user = await this.findOne({ email });
  if (user) {

    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw new Error("Incorrect password");
  }
  throw new Error("Incorrect email");
};

module.exports = model("User", userSchema);
