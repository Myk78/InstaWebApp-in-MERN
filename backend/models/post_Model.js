const mongoose = require("mongoose");
const postSchema = mongoose.Schema({
  caption: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  likes: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  comments: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "comments",
  },
});
module.exports = mongoose.model("post", postSchema);
