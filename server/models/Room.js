const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
{
    roomCode:{
        type:String,
        required:true,
        unique:true
    },

    quizId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Quiz",
        required:true
    },

    hostId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    participants:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    duration: {
    type: Number,
    default: 30
},
    status:{
        type:String,
        enum:[
            "waiting",
            "live",
            "finished"
        ],
        default:"waiting"
    },

    startTime:{
        type:Date,
        default:null
    },
    endTime:{
    type:Date
},
    submittedUsers:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
}]
},
{
    timestamps:true
}
);

module.exports =
    mongoose.model("Room",roomSchema);