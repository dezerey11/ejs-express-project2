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
    // The goals property defined as an array of objects that match the Goal schema
    posts: { type: [PostSchema], default: [] },
  },
  { timestamps: true }
);

// The User Model
const User = model("User", UserSchema);

// The Post Model
const Post = model("Post", PostSchema);

// Export the User Model
module.exports = {
  User,
  Post,
};
