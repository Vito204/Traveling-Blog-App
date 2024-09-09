const File = require("../models/File");
const Post = require("../models/Post");
const cloudinary = require("../config/cloudinary");

//1.1 Render the new post page
exports.getNewPost = (req, res) => {
  res.render("newPost", {
    title: "Create Post",
    user: req.user,
    error: "",
    success: "",
  });
};

//1.2 Making new post
exports.makeNewPost = async (req, res) => {
  const { title, content, location } = req.body;
  //save the images into database
  const images = await Promise.all(
    req.files.map(async (file) => {
      const newFile = new File({
        url: file.path,
        public_id: file.filename,
        uploaded_by: req.user._id,
      });
      await newFile.save();
      return {
        url: newFile.url,
        public_id: newFile.public_id,
      };
    })
  );
  //make a new post
  const newPost = new Post({
    title,
    content,
    location,
    author: req.user._id,
    images,
  });
  await newPost.save();
  res.render("newPost", {
    title: "Make Post",
    user: req.user,
    error: "",
    success: "Post successfully！",
  });
};

//2.1 Get all Posts
exports.getPosts = async (req, res) => {
  const posts = await Post.find().populate("author", "username");
  res.render("posts", {
    title: "Posts",
    posts,
    user: req.user,
    success: "",
    error: "",
  });
};

//2.2 Get post by id
exports.getPostById = async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("author", "username")
    .populate({
      path: "comments",
      populate: {
        path: "author",
        model: "User",
        select: "username",
      },
    });
  res.render("postDetails", {
    title: "Post",
    post,
    user: req.user,
    success: "",
    error: "",
  });
};

//2.3 Get editable post page
exports.getEditPost = async (req, res) => {
  //find the post
  const post = await Post.findById(req.params.id);
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
  //get the editable post page
  res.render("editPost", {
    title: "Edit Post",
    post,
    user: req.user,
    error: "",
    success: "",
  });
};

//2.4 update post
exports.updatePost = async (req, res) => {
  const { title, content } = req.body;
  //find the post
  const post = await Post.findById(req.params.id);
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
  //error if author does not match
  if (post.author.toString() !== req.user._id.toString()) {
    return res.render("postDetails", {
      title: "Post",
      post,
      user: req.user,
      error: "You are not authorized to edit this post",
      success: "",
    });
  }
  //save the edited post
  post.title = title || post.title;
  post.content = content || post.content;
  if (req.files) {
    await Promise.all(
      post.images.map(async (image) => {
        await cloudinary.uploader.destroy(image.public_id);
      })
    );
  }
  post.images = await Promise.all(
    req.files.map(async (file) => {
      const newFile = new File({
        url: file.path,
        public_id: file.filename,
        uploaded_by: req.user._id,
      });
      await newFile.save();
      return {
        url: newFile.url,
        public_id: newFile.public_id,
      };
    })
  );
  await post.save();
  res.redirect(`/posts/${post._id}`);
};

//3 Delete post
exports.deletePost = async (req, res) => {
  //find the post
  const post = await Post.findById(req.params.id);
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
  //error if author does not match
  if (post.author.toString() !== req.user._id.toString()) {
    return res.render("postDetails", {
      title: "Post",
      post,
      user: req.user,
      error: "You have no right to delete this post",
      success: "",
    });
  }
  //delete the image from the cloud
  await Promise.all(
    post.images.map(async (image) => {
      await cloudinary.uploader.destroy(image.public_id);
    })
  );
  //delete the post
  await Post.findByIdAndDelete(req.params.id);
  res.redirect("/posts");
};
