const { Schema, model } = require("mongoose");

const postSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  picture: {
    type: String,
  },
  content: {
    type: String,
<<<<<<< HEAD
=======
    required: true,
>>>>>>> a4499a909691ed513a890b7c7cae34ee18bdb0f2
  },
  likers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  likesCount: {
    type: Number,
    default: 0,
  },
  comments: [
    {
      commenter: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      comment: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model("Post", postSchema);
