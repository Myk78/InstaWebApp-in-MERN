const app = require("../app");
var express = require("express");
// const router = app.Router();
var router = express.Router();
const { upload } = require("../config/multerConfig");
const {
  registerUser,
  login,
  logout,
  getProfile,
  editProfile,
  getSuggestedUser,
  followorUnfollow,
} = require("../controllers/userController");
const { isAuthenticate } = require("../middlewares/isAuthenticated");

router.post("/register", registerUser);
router.post("/login", login);
router.get("/logout", logout);
router.get("/:id/profile", isAuthenticate, getProfile);
router.post(
  "/profile/edit",
  isAuthenticate,
  upload.single("profilePic"),
  editProfile
);
router.get("/suggestedUser", isAuthenticate, getSuggestedUser);
router.post("/followAndunFollow", isAuthenticate, followorUnfollow);

module.exports = router;
