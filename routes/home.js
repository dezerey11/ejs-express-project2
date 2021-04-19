////////////  IMPORT ROUTER ////////////

const express = require("express");
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const indexCtrl = require("../controllers/index");
// Use desctructuring to get user and post
const { User, Post } = require("../models/index");
// Use destructuring to get topics
const { topics } = require("../controllers/index");

////////////  CUSTOM MIDDLEWARE FUNCTIONS ////////////

// Middleware to check if userId is in sessions and create req.user
const addUserToRequest = async (req, res, next) => {
  if (req.session.userId) {
    req.user = await User.findById(req.session.userId);
    next();
  } else {
    next();
  }
};
// Auth Middleware Function to check if user authorized for route
const isAuthorized = (req, res, next) => {
  // check if user session property exists, if not redirect back to login page
  if (req.user) {
    //if user exists, wave them by to go to route handler
    next();
  } else {
    //redirect the not logged in user
    res.redirect("/auth/login");
  }
};

////////////  ROUTER SPECIFIC MIDDLEWARE  ////////////

router.use(addUserToRequest);

////////////  ROUTER ROUTES ///////////

router.get("/", (req, res) => {
  res.render("welcome");
});

// route to get topics
router.get("/topics", async (req, res) => {
  const user = await User.findOne({ username: req.user.username });
  res.render("topics", {
    topics,
    username: user.username,
  });
});

// route to get posts in a topic
router.get("/topics/:topic", async (req, res) => {
  const topic = req.params.topic;
  const posts = await Post.find({ topic: topic });
  const user = await User.findOne({ username: req.user.username });
  res.render("topicpage", {
    topic,
    posts,
    username: user.username,
  });
});

router.get("/userpage", isAuthorized, indexCtrl.index);
router.get("/userpage/new", isAuthorized, indexCtrl.new);
router.post("/userpage", isAuthorized, indexCtrl.create);
router.get("/userpage/:id/edit", isAuthorized, indexCtrl.edit);
router.put("/userpage/:id", isAuthorized, indexCtrl.update);
router.delete("/userpage/:id", isAuthorized, indexCtrl.destroy);
router.get("/post/:id", indexCtrl.show);

////////////  SIGNUP ROUTES ////////////

router.get("/auth/signup", (req, res) => {
  res.render("auth/signup");
});

router.post("/auth/signup", async (req, res) => {
  try {
    // generate salt for hashing
    const salt = await bcrypt.genSalt(10);
    // hash the password
    req.body.password = await bcrypt.hash(req.body.password, salt);
    // default posts to an empty array
    req.body.posts = [];
    // create the User
    await User.create(req.body);
    // Redirect to login page
    res.redirect("/auth/login");
  } catch (error) {
    res.json(error);
  }
});

//////////// LOGIN ROUTES ////////////

router.get("/auth/login", (req, res) => {
  res.render("auth/login");
});

router.post("/auth/login", async (req, res) => {
  try {
    // check if the user exists
    const user = await User.findOne({ username: req.body.username });
    if (user) {
      // check if password matches
      const result = await bcrypt.compare(req.body.password, user.password);
      if (result) {
        // create user session property
        req.session.userId = user._id;
        // redirect to /topics
        res.redirect("/topics");
      } else {
        // send error if password doesn't match
        res.render("error/password");
      }
    } else {
      // send error if user doesn't exist
      res.render("error/user");
    }
  } catch (error) {
    res.json(error);
  }
});

//////////// LOGOUT ROUTE ////////////

router.get("/auth/logout", (req, res) => {
  // remove the userId property from the session
  req.session.userId = null;
  // redirect back to the main page
  res.redirect("/");
});

//////////// EXPORT ROUTER ////////////
module.exports = router;
