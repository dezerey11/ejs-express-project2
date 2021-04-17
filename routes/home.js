///////////////////////////////
// Import Router
////////////////////////////////
const express = require("express");
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const indexCtrl = require("../controllers/index");
// Use desctructuring to get user
const { User, Post } = require("../models/index");

const { topics } = require("../controllers/index");
///////////////////////////////
// Custom Middleware Functions
////////////////////////////////

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

///////////////////////////////
// Router Specific Middleware
////////////////////////////////

router.use(addUserToRequest);

///////////////////////////////
// Router Routes
////////////////////////////////
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
router.get("/:topic", async (req, res) => {
  const topic = req.params.topic;
  const posts = await Post.find({ topic: topic });
  const user = await User.findOne({ username: req.user.username });
  res.render("topicpage", {
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

// SIGNUP ROUTES
router.get("/auth/signup", (req, res) => {
  res.render("auth/signup");
});

router.post("/auth/signup", async (req, res) => {
  try {
    // generate salt for hashing
    const salt = await bcrypt.genSalt(10);
    // hash the password
    req.body.password = await bcrypt.hash(req.body.password, salt);

    // Default posts to an empty array
    req.body.posts = [];

    // Create the User
    await User.create(req.body);
    // Redirect to login page
    res.redirect("/auth/login");
  } catch (error) {
    res.json(error);
  }
});

// Login Route
router.get("/auth/login", (req, res) => {
  res.render("auth/login");
});

router.post("/auth/login", async (req, res) => {
  try {
    //check if the user exists (make sure to use findOne not find)
    const user = await User.findOne({ username: req.body.username });
    if (user) {
      // check if password matches
      const result = await bcrypt.compare(req.body.password, user.password);
      if (result) {
        // create user session property
        req.session.userId = user._id;
        //redirect to /userpage
        res.redirect("/userpage");
      } else {
        // send error is password doesn't match
        res.json({ message: "password doesn't match" });
      }
    } else {
      // send error if user doesn't exist
      res.json({ message: "user doesn't exist" });
    }
  } catch (error) {
    res.json(error);
  }
});

// Logout Route
router.get("/auth/logout", (req, res) => {
  // remove the userId property from the session
  req.session.userId = null;
  // redirect back to the main page
  res.redirect("/");
});

///////////////////////////////
// Export Router
////////////////////////////////
module.exports = router;
