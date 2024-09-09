const express = require("express");
const {
  getNewPost,
  makeNewPost,
  getPosts,
  getPostById,
  getEditPost,
  updatePost,
  deletePost,
} = require("../controllers/postControllers");
const upload = require("../config/multer");
const { ensureAuthenticated } = require("../middlewares/auth");
const postRoutes = express.Router();

//Render the new post page
postRoutes.get("/add", getNewPost);

//Add a new post
postRoutes.post(
  "/add",
  ensureAuthenticated,
  upload.array("images", 9),
  makeNewPost
);

//Get all posts
postRoutes.get("/", getPosts);

//Get post by id
postRoutes.get("/:id", getPostById);

//Edit post
postRoutes.get("/:id/edit", getEditPost);

//Override put method
postRoutes.put(
  "/:id",
  ensureAuthenticated,
  upload.array("images", 9),
  updatePost
);

//Delete post
postRoutes.delete("/:id", ensureAuthenticated, deletePost);

module.exports = postRoutes;
