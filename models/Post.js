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
    required: true,
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
  eventId: {
    type: Schema.Types.ObjectId,
    ref: "Event",
  },
});

module.exports = model("Post", postSchema);