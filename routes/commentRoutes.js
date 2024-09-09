const express = require("express");
const commentRoutes = express.Router();
const {
  addComment,
  getEditComment,
  updateComment,
  deleteComment,
} = require("../controllers/commentControllers");
const { ensureAuthenticated } = require("../middlewares/auth");

//Add comment
commentRoutes.post("/posts/:id/comments", ensureAuthenticated, addComment);

//Render editable comment page
commentRoutes.get("/comments/:id/edit", getEditComment);

//Update comment
commentRoutes.put("/comments/:id", ensureAuthenticated, updateComment);

//Delete comment
commentRoutes.delete("/comments/:id", ensureAuthenticated, deleteComment);

module.exports = commentRoutes;
