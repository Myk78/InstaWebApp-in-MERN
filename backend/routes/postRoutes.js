const express = require("express");
const router = express.Router();

const {
  addNewPost,
  getAllPost,
  getUserPost,
  likePost,
  dislikePost,
  addComents,
  getCommentsOfPost,
  deletePost,
} = require("../controllers/PostController");
const { isAuthenticate } = require("../middlewares/isAuthenticated");
const { upload } = require("../config/multerConfig");

router.post(
  "/post/addpost",
  upload.single("image"),
  isAuthenticate,
  addNewPost
);
router.get("/post/getpost", isAuthenticate, getAllPost);
router.get("/post/getUserpost", isAuthenticate, getUserPost);
router.get("/post/:id/likepost", isAuthenticate, likePost);
router.get("/post/:id/dislikepost", isAuthenticate, dislikePost);
router.post("/post/:id/Comment", isAuthenticate, addComents);
router.post("/post/getComment", isAuthenticate, getCommentsOfPost);
router.post("/post/deletepost/:id", isAuthenticate, deletePost);
router.post("/post/:id/bookmark", isAuthenticate, deletePost);
module.exports = router;
