//import post model
const { Post, User } = require("../models/index");

// index page - all posts
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
  res.render("posts/new", {
    username: user.username,
  });
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

module.exports = {
  index,
  new: newPost,
  create,
  show,
};
