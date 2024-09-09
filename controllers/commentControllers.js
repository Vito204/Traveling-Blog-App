const Post = require("../models/Post");
const Comment = require("../models/Comment");

//1 Add Comment
exports.addComment = async (req, res) => {
  const { content } = req.body;
  const postId = req.params.id;
  //find the post
  const post = await Post.findById(postId);
  //error if no post found
  if (!post) {
    return res.render("postDetails", {
      title: "Post",
      post,
      user: req.user,
      error: "Post not found",
      success: "",
    });
  }
  //error if no content of comment
  if (!content) {
    return res.render("postDetails", {
      title: "Post",
      post,
      user: req.user,
      error: "Comment cannot be empty",
      success: "",
    });
  }
  //save the comment
  const comment = new Comment({
    content,
    post: postId,
    author: req.user._id,
  });
  await comment.save();
  //push the comment into the post
  post.comments.push(comment._id);
  await post.save();
  //jump to the post
  res.redirect(`/posts/${postId}`);
};

//2 Get editable comment
exports.getEditComment = async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  //error if comment not found
  if (!comment) {
    return res.render("postDetails", {
      title: "Post",
      comment,
      user: req.user,
      error: "Comment not found",
      success: "",
    });
  }
  //render the editable comment
  res.render("editComment", {
    title: "Comment",
    comment,
    user: req.user,
    error: "",
    success: "",
  });
};

//3 Update comment
exports.updateComment = async (req, res) => {
  const { content } = req.body;
  const comment = await Comment.findById(req.params.id);
  //error if comment not found
  if (!comment) {
    return res.render("postDetails", {
      title: "Post",
      comment,
      user: req.user,
      error: "Comment not found",
      success: "",
    });
  }
  //error if user not match
  if (comment.author.toString() != req.user._id.toString()) {
    return res.render("postDetails", {
      title: "Post",
      comment,
      user: req.user,
      error: "You have no right to edit this comment",
      success: "",
    });
  }
  //save the comment
  comment.content = content || comment.content;
  await comment.save();
  res.redirect(`/posts/${comment.post}`);
};

//4 Delete Comment
exports.deleteComment = async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  //error if comment not found
  if (!comment) {
    return res.render("postDetails", {
      title: "Post",
      comment,
      user: req.user,
      error: "Comment not found",
      success: "",
    });
  }
  //error if user not match
  if (comment.author.toString() != req.user._id.toString()) {
    return res.render("postDetails", {
      title: "Post",
      comment,
      user: req.user,
      error: "You have no right to delete this comment",
      success: "",
    });
  }
  //delete the comment
  await Comment.findByIdAndDelete(req.params.id);
  res.redirect(`/posts/${comment.post}`);
};
