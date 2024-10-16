const mongoose = require("mongoose");
const messageSchema = mongoose.Schema({
  senderID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  reciverID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  message: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model("message", messageSchema);
