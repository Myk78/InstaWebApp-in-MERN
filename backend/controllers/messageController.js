const { promise } = require("bcrypt/promises");
const conversation_Model = require("../models/conversation_Model");
const message_Model = require("../models/message_Model");

module.exports.sendMessage = async (req, res) => {
  try {
    const senderid = req.id;
    const reciverid = req.params.id;
    const { message } = req.body;

    let conversation = await conversation_Model.findOne({
      participants: { $all: [senderid, reciverid] },
    });

    if (!conversation) {
      conversation = await conversation_Model.create({
        participants: [senderid, reciverid],
      });
    }
    const newMessage = await message_Model.create({
      senderid,
      reciverid,
      message,
    });
    if (newMessage) conversation.messages.push(newMessage._id);

    await Promise.all([conversation.save(), newMessage.save()]);

    return res.status(200).json({
      success: true,
      newMessage,
    });
  } catch (error) {
    console.log(error);
  }
};
module.exports.getMessage = async (req, res) => {
  try {
    const senderid = req.id;
    const reciverid = req.params.id;
    const conversation = await conversation_Model.findOne({
      participants: { $all: [senderid, reciverid] },
    });
    if (!conversation)
      return res.status(200).json({ success: true, message: [] });
    return res
      .status(200)
      .json({ success: true, messsage: conversation?.messages });
  } catch (error) {
    console.log(error);
  }
};
