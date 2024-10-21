const bcrypt = require("bcrypt");
const userModel = require("../models/user_Model");

const { generateToken } = require("../utils/generateToken");
const { getDataUri } = require("../utils/datauri");
const { cloudinary } = require("../utils/cloudinary");
const user_Model = require("../models/user_Model");

module.exports.registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(401).json({
        message: "Feilds are required",
        success: false,
      });
    }
    const user = await userModel.findOne({ email });
    if (user) {
      return res.status(401).json({
        message: "Email is already registered",
        success: false,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = await userModel.create({
      username,
      email,
      password: hashedPassword,
    });
    return res.status(401).json({
      message: "Account create Successfully",
      success: true,
    });
  } catch (err) {
    console.log(err.message);
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    let user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid Email and Password",
        success: false,
      });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid Email and Passwords",
        success: false,
      });
    }
    user = {
      _id: user.id,
      username: user.username,
      email: user.email,
      profile: user.profile,
      bio: user.bio,
      following: user.following,
      followers: user.followers,
      posts: user.posts,
    };
    const token = await generateToken(user);
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      .json({ message: `Welcome back ${user.username}`, success: true, user });
  } catch (err) {
    console.log(err.message);
  }
};

module.exports.logout = async (_, res) => {
  try {
    return res
      .cookie("token", "", {
        httpOnly: true,
        secure: true,
        expires: new Date(0),
      })
      .json({
        message: "logged Out Successfully",
        success: true,
      });
  } catch (err) {
    console.log(err);
  }
};

module.exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.params.id;
    let user = await userModel.findById(userId).select("-password");
    return res.status(200).json({
      user,
      success: true,
    });
  } catch (err) {}
};

module.exports.editProfile = async (req, res, next) => {
  try {
    const userid = req.id;
    const { bio, gender } = req.body;
    const profilePicture = req.file;
    let cloudRespone;
    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);
      cloudRespone = await cloudinary.uploader.upload(fileUri);
    }
    const user = await userModel.findById(userid);
    if (!user) {
      return res.status(404).json({
        message: "User not Found.",
        success: false,
      });
    }
    if (bio) user.bio = bio;
    if (gender) user.gender = gender;
    if (profilePicture) user.profilePic = cloudRespone.secure_url;
    await user.save();
    return res.status(200).json({
      message: "Profile Uploaded",
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports.getSuggestedUser = async (req, res, next) => {
  try {
    const SuggestedUser = await user_Model
      .findById({ _id: { $ne: req.id } })
      .select("password");
    if (!SuggestedUser) {
      return res.status(404).json({
        message: "Currently do not have user",
      });
    }
    return res.status(200).json({
      success: true,
      user: SuggestedUser,
    });
  } catch (err) {
    console.log(err);
  }
};
module.exports.followorUnfollow = async (req, res, next) => {
  try {
    const followKarnaWala = req.id;
    const jiskoFollowKarnaH = params.req.id;
    if (followKarnaWala === jiskoFollowKarnaH) {
      return res.status(400).json({
        message: "Sorry you dn't follow your self",
        success: false,
      });
    }
    const user = await userModel.findById(followKarnaWala);
    const targetUser = await userModel.findById(jiskoFollowKarnaH);

    if (!user || !targetUser) {
      return res
        .status(401)
        .json({ message: "User is not Found", success: false });
    }
    const isFollowing = user.following.includes(jiskoFollowKarnaH);
    if (isFollowing) {
      await Promise.all([
        user.updateOne(
          { _id: followKarnaWala },
          { $pull: { following: jiskoFollowKarnaH } }
        ),
        user.updateOne(
          { _id: jiskoFollowKarnaH },
          { $pull: { followers: followKarnaWala } }
        ),
      ]);
      return res
        .status(200)
        .json({ message: "unfollow Successfully", success: true });
    } else {
      await Promise.all([
        user.updateOne(
          { _id: followKarnaWala },
          { $push: { following: jiskoFollowKarnaH } }
        ),
        user.updateOne(
          { _id: jiskoFollowKarnaH },
          { $push: { followers: followKarnaWala } }
        ),
      ]);
      return res
        .status(200)
        .json({ message: "follow Successfully", success: true });
    }
  } catch (error) {
    console.log(error);
  }
};
