// import mongoose
const mongoose = require("mongoose");
// import post and user model
const { Post, User } = require("../models/index");

// topics array
const topics = [
  "DIY Home",
  "Cars",
  "Fitness",
  "Food",
  "Crafting",
  "Sports",
  "Makeup",
  "Art",
  "Coding",
];

// Index page - displays all posts from the user
const index = async (req, res) => {
  const user = await User.findOne({ username: req.user.username });
  const { posts, username } = await user.populate("posts").execPopulate();
  res.render("userpage", {
    username,
    posts,
  });
};

// New page - creates a new post form
const newPost = async (req, res) => {
  const user = await User.findOne({ username: req.user.username });
  res.render("posts/new", {
    username: user.username,
    topics,
  });
};

// Destroy post - deletes a post and removes it from the database
const destroy = async (req, res) => {
  const id = req.params.id;
  await Post.findByIdAndDelete(id);
  await User.updateOne(
    { username: req.user.username },
    { $pullAll: { posts: [id] } }
  );
  res.redirect("/userpage");
};

// Update page - updates posts and redirects to post show page
const update = async (req, res) => {
  const id = req.params.id;
  await Post.findByIdAndUpdate(id, req.body);
  res.redirect(`/post/${id}`);
};

// Create - creates a post and redirects to the user page
const create = async (req, res) => {
  req.body.user = req.user.username;
  //create the post
  const post = await Post.create(req.body);
  // fetch up to date user
  const user = await User.findOne({ username: req.user.username });
  // push the new post into posts and save
  user.posts.push(post._id);
  await user.save();
  res.redirect("/userpage");
};

// Edit page- page with form to edit a post
const edit = async (req, res) => {
  const id = req.params.id;
  const post = await Post.findById(id);
  const user = await User.findOne({ username: req.user.username });
  res.render("posts/edit", {
    post,
    username: user.username,
    topics,
  });
};

// Show page - shows a post and it's information
const show = async (req, res) => {
  const id = req.params.id;
  const post = await Post.findById(id);
  const user = await User.findOne({ username: req.user.username });
  res.render("posts/show", {
    post,
    username: user.username,
  });
};

// Export
module.exports = {
  index,
  new: newPost,
  create,
  show,
  update,
  edit,
  destroy,
  topics,
};
