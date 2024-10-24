const { text } = require('express');
const mongoose = require('mongoose');
const commentSchema = mongoose.Schema({
    text:{
        type:String,
        required:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"post"
    },
});
module.exports = mongoose.model("comments",commentSchema);