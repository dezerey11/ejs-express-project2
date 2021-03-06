const mongoose = require("mongoose");
// Import Schema and Model
const { Schema, model } = require("../db/connection.js");

// The Post Schema
const PostSchema = new Schema(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
    body: { type: String, required: true },
    topic: { type: String, required: true },
    user: { type: String, required: true },
  },
  { timestamps: true }
);

// The User Schema
const UserSchema = new Schema(
  {
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  { timestamps: true }
);

// The User Model
const User = model("User", UserSchema);

// The Post Model
const Post = model("Post", PostSchema);

// Export the Models
module.exports = {
  User,
  Post,
};
