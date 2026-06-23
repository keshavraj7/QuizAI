const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
{
    title:{
        type:String,
        required:true
    },

    subject:{
        type:String,
        required:true
    },

    difficulty:{
        type:String,
        required:true
    },
    questions:[
        {
            question:{
                type:String
            },

            options:[
                {
                    type:String
                }
            ],

            answer:{
                type:String
            }
        }
    ],

    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},
{
    timestamps:true
}
);

module.exports = mongoose.model("Quiz",quizSchema);