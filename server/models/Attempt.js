const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    quizId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Quiz",
        required:true
    },

    roomId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Room",
        required:true
    },

    score:{
        type:Number,
        required:true
    },

    totalQuestions:{
        type:Number,
        required:true
    },

    answers:[String]

},{
    timestamps:true
});

module.exports = mongoose.model(
    "Attempt",
    attemptSchema
);