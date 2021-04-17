// import mongoose
const mongoose = require("mongoose");
//import post model
const { Post, User } = require("../models/index");

// index page - all posts from user
const index = async (req, res) => {
  const user = await User.findOne({ username: req.user.username });
  const { posts, username } = await user.populate("posts").execPopulate();
  res.render("userpage", {
    username, //username: username
    posts,
  });
};

// new page - to create a new post form
const newPost = async (req, res) => {
  const user = await User.findOne({ username: req.user.username });
  const topics = [
    "",
    "Home",
    "Cars",
    "Fitness",
    "Food",
    "Crafting",
    "Sports",
    "Makeup",
    "Art",
    "Coding",
  ];
  res.render("posts/new", {
    username: user.username,
    topics,
  });
};

// destroy post - destroys a post
const destroy = async (req, res) => {
  const id = req.params.id;
  await Post.findByIdAndDelete(id);

  await User.updateOne(
    { username: req.user.username },
    { $pullAll: { posts: [id] } }
  );

  res.redirect("/userpage");
};

// update page - updates posts and redirects to index page
const update = async (req, res) => {
  const id = req.params.id;
  await Post.findByIdAndUpdate(id, req.body);

  res.redirect(`/post/${id}`);
};

// create - creates a post and redirects to the user page
const create = async (req, res) => {
  //add the user's name into the post
  req.body.user = req.user.username;
  //create the post
  const post = await Post.create(req.body);

  // fetch up to date user
  const user = await User.findOne({ username: req.user.username });
  const populatedUser = await user.populate("posts").execPopulate();

  //console.log(populatedUser);

  // push new post and save
  user.posts.push(post._id);
  await user.save();

  res.redirect("/userpage");
};

// edit page - page  to edit a post
const edit = async (req, res) => {
  const id = req.params.id;
  const post = await Post.findById(id);
  const user = await User.findOne({ username: req.user.username });
  res.render("posts/edit", {
    post,
    username: user.username,
  });
};

// show page - to show a post and it's information
const show = async (req, res) => {
  const id = req.params.id;
  const post = await Post.findById(id);
  const user = await User.findOne({ username: req.user.username });
  res.render("posts/show", {
    post,
    username: user.username,
  });
};

//topics
const topics = [
  "Home",
  "Cars",
  "Fitness",
  "Food",
  "Crafting",
  "Sports",
  "Makeup",
  "Art",
  "Coding",
];

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
