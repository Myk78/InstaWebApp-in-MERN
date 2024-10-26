const { populate } = require("dotenv");
const post_Model = require("../models/post_Model");
const user_Model = require("../models/user_Model");
const { cloudinary } = require("../utils/cloudinary");
const comment_Model = require("../models/comment_Model");
const sharp = require("sharp");

module.exports.addNewPost = async (req, res, next) => {
  try {
    const { caption } = req.body;
    const image = req.file; // Multer puts the file in req.file
    const authorId = req.id;

    if (!image) return res.status(404).json({ message: "Image Required" });

    // Image upload handling and cloudinary logic as before
    const optimizeImageBuffer = await sharp(image.buffer)
      .resize({ width: 800, height: 800, fit: "inside" })
      .toFormat("jpeg", { quality: 80 })
      .toBuffer();

    const fileUri = `data:image/jpeg;base64,${optimizeImageBuffer.toString(
      "base64"
    )}`;

    const cloudRespone = await cloudinary.uploader.upload(fileUri);

    const post = await post_Model.create({
      caption,
      image: cloudRespone.secure_url,
      user: authorId,
    });

    const user = await user_Model.findById(authorId);
    if (user) {
      user.posts.push(post._id);
      await user.save();
    }

    await post.populate({ path: "user", select: "-password" });

    return res.status(201).json({
      message: "New Post added",
      post,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports.getAllPost = async (req, res, next) => {
  try {
    const posts = await post_Model
      .find()
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "username, profilePic" })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "user",
          select: "username, profilePic",
        },
      });
    return res.status(200).json({
      posts,
      success: true,
    });
  } catch (error) {}
};
module.exports.getUserPost = async (req, res) => {
  try {
    const authorId = req.id;
    const posts = await post_Model
      .find({ user: authorId })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "username profilePic",
      })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "user",
          select: "username profilePic",
        },
      });
    return res.status(200).json({
      posts,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports.likePost = async (req, res) => {
  try {
    const likeKrnewalaUser_Id = req.id;
    const postId = req.params.id;
    const post = await post_Model.findById(postId);
    if (!post)
      return res
        .status(404)
        .json({ message: "Post not found", success: false });

    // like post logic
    await post.updateOne({ $addToSet: { likes: likeKrnewalaUser_Id } });
    await post.save();
    // implement socketIO for real time notificatioin

    return res.status(200).json({ message: "Post Liked", success: true });
  } catch (error) {
    console.log(error);
  }
};

module.exports.dislikePost = async (req, res) => {
  try {
    const likeKrnewalaUser_Id = req.id;
    const postId = req.params.id;
    const post = await post_Model.findById(postId);
    if (!post)
      return res
        .status(404)
        .json({ message: "Post not found", success: false });

    // like post logic
    await post.updateOne({ $pull: { likes: likeKrnewalaUser_Id } });
    await post.save();
    // implement socketIO for real time notificatioin

    return res.status(200).json({ message: "Post Liked", success: true });
  } catch (error) {
    console.log(error);
  }
};

module.exports.addComents = async (req, res) => {
  try {
    const postId = req.params.id;
    const commentkarnaWala = req.id;
    const { text } = req.body;

    // Find the post first
    const post = await post_Model.findById(postId);

    if (!text)
      return res.status(401).json({
        message: "Empty comment is not allowed",
        success: false,
      });

    // Create the comment
    const comment = await comment_Model.create({
      text,
      user: commentkarnaWala,
      post: postId,
    });

    // Push the comment ID to the post's comments array
    post.comments.push(comment._id); // Use comment._id to get the created comment's ID
    await post.save();

    // Populate the user in the comment after it has been created
    const populatedComment = await comment_Model
      .findById(comment._id) // Find the newly created comment
      .populate({
        path: "user",
        select: "username profilePic",
      });

    return res.status(201).json({
      message: "Comment added successfully",
      comment: populatedComment, // Return the populated comment
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

module.exports.getCommentsOfPost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const comments = await comment_Model
      .findOne({ post: postId })
      .populate("user", "username profilePic");
    if (!comments)
      return res
        .status(404)
        .json({ message: "No comments Yet on this post", success: false });
    return res.status(200).json({ success: true, comments });
  } catch (error) {
    console.log(error);
  }
};

module.exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const AuthorId = req.id;
    const post = await post_Model.findById(postId);
    if (!post)
      return res
        .status(404)
        .json({ message: "Post not found", success: false });
    if (post.user.toString() != AuthorId)
      return res.status(403).json({ message: "Unauthorized User" });

    // delete post form posts
    await post_Model.findByIdAndDelete(postId);

    // remove the id of post from user posts
    let user = await user_Model.findById(AuthorId);
    user.posts = user.posts.filter((id) => id.toString() != postId);
    await user.save();

    // delete associated comment
    await comment_Model.deleteMany({ post: postId });
    return res.status(200).json({
      message: "post deleted",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports.AddBookmark = async (req, res) => {
  const postId = req.params.id;
  const AuthorId = req.id;
  const post = await post_Model.findById(postId);
  if (!post)
    return res.status(404).json({ message: "Post not found", success: false });
  const user = await user_Model.findById(AuthorId);
  if (user.bookmarks.includes(post_.id)) {
    await user.updateOne({ $pull: { bookmarks: post_.id } });
    await user.save();
    return res.status(200).json({ message: "remove from bookmark" });
  } else {
    await user.updateOne({ $addToSet: { bookmarks: post_.id } });
    await user.save();
    return res.status(200).json({ message: "post is bookmark", success: true });
  }
};
