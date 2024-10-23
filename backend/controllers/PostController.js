const { populate } = require("dotenv");
const post_Model = require("../models/post_Model");
const user_Model = require("../models/user_Model");
const { cloudinary } = require("../utils/cloudinary");
const comment_Model = require("../models/comment_Model");

module.exports.addNewPost = async (req, res, next) => {
  try {
    const { caption } = req.body;
    const image = req.file;
    const authorId = req.id;

    if (!image) return res.status(404).json({ message: "Image Required" });

    //image upload
    const optimizeImageBuffer = await sharp(image.buffer)
      .resize({ width: 800, height: 800, fit: "inside" })
      .toformat("jpeg", { quality: 80 })
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
    const user = await user_Model.findOne(authorId);
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
        select: "username, profilePic",
      })
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
  } catch (error) {
    console.log(error);
  }
};

module.exports.likePost = async (req, res) => {
  try {
    const likeKrnewalaUser_Id = req.id;
    const postId = req.params.id;
    const post = await post_Model.findOne(postId);
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
    const post = await post_Model.findOne(postId);
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
    const post = await post_Model.findOne(postId);
    if (!text)
      return res.status(401).json({
        message: "Empty comment is not allowed",
        success: false,
      });
    const comment = await comment_Model
      .create({
        text,
        user: commentkarnaWala,
        post: postId,
      })
      .populate({
        path: "user",
        select: "username, profilePic",
      });
    post.comments.push(comment_.id);
    await post.save();
    return res.status(201).json({
      message: "comment add Successfully",
      comment,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};
