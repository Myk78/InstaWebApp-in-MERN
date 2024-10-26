const mongoose = require("mongoose");
const messageSchema = mongoose.Schema({
  senderid: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  reciverid: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  message: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model("message", messageSchema);
