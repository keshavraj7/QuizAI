const Room = require("../models/Room");
const Attempt = require("../models/Attempt");
const Quiz = require("../models/Quiz");
const User = require("../models/User");
const createRoom = async (req,res)=>{

    try{

        const { quizId } = req.params;

        const quiz =
            await Quiz.findById(quizId);

        if(!quiz){

            return res.status(404).json({
                message:"Quiz not found"
            });

        }

        const roomCode =
            Math.random()
            .toString(36)
            .substring(2,8)
            .toUpperCase();

        const room =
            await Room.create({

                roomCode,

                quizId,

                hostId:req.user.userId,

                participants:[
                    req.user.userId
                ]

            });
            await User.findByIdAndUpdate(

    req.user.userId,

    {
        activeRoom:room._id
    }

);
        res.status(201).json({

            message:"Room Created",

            room

        });

    }
    catch(err){

        console.log(err);

        res.status(500).json({
            message:"Server Error"
        });

    }

};
const joinRoom = async (req,res)=>{
    

    try{
        const user =
await User.findById(
    req.user.userId
);

if(user.activeRoom){

    const activeRoom =
    await Room.findById(
        user.activeRoom
    );

    if(
        activeRoom &&
        activeRoom.status !==
        "finished"
    ){

        return res.status(400).json({

            message:
            "You are already in a room"

        });

    }

    user.activeRoom = null;

    await user.save();

}
        const { roomCode } = req.body;

        const room =
            await Room.findOne({
                roomCode
            });

        if(!room){

            return res.status(404).json({
                message:"Room not found"
            });

        }

        if(
            room.status !== "waiting"
        ){

            return res.status(400).json({
                message:
                "Quiz already started"
            });

        }

        const alreadyJoined =
            room.participants.includes(
                req.user.userId
            );

        if(!alreadyJoined){

            room.participants.push(
                req.user.userId
            );
            await User.findByIdAndUpdate(

    req.user.userId,

    {
        activeRoom:room._id
    }

);
            await room.save();
            const io =
    req.app.get("io");

const updatedRoom =
    await Room.findById(
        room._id
    )
    .populate(
        "hostId",
        "name"
    )
    .populate(
        "participants",
        "name"
    )
    .populate(
        "quizId"
    );

io.to(
    room.roomCode
).emit(
    "participant-joined",
    updatedRoom
);
        }

        res.status(200).json({
            message:"Joined Room",
            room
        });

    }
    catch(err){

        console.log(err);

        res.status(500).json({
            message:"Server Error"
        });

    }
};

const getRoom = async (req,res)=>{

    try{

        const { roomCode } =
            req.params;

        const room =
await Room.findOne({
    roomCode
})
.populate("hostId","name")
.populate("participants","name")
.populate("quizId")
.populate("submittedUsers","name");
        if(!room){

            return res.status(404).json({
                message:"Room not found"
            });

        }
        if(
    room.status === "live"
    &&
    room.endTime
    &&
    new Date() >= room.endTime
){

    room.status = "finished";
    await room.save();
    await User.updateMany(
        {
            _id:{
                $in:
                room.participants
            }
        },
        {
            activeRoom:null
        }
    );
    const io =
    req.app.get("io");

        io.to(
            room.roomCode
        ).emit(
            "room-finished"
        );
}
        res.status(200).json(room);

    }
    catch(err){

        console.log(err);

        res.status(500).json({
            message:"Server Error"
        });

    }

};
const startRoom = async (req,res)=>{

    try{

        const { roomCode } =
            req.params;

        const room =
            await Room.findOne({
                roomCode
            });

        if(!room){

            return res.status(404).json({
                message:"Room not found"
            });

        }

        if(
            room.hostId.toString()
            !==
            req.user.userId
        ){

            return res.status(403).json({
                message:
                "Only host can start room"
            });

        }

        room.status = "live";

        room.startTime = new Date();

room.endTime = new Date(
    Date.now() +
    room.duration * 60 * 1000
);

        await room.save();
    const io =
    req.app.get("io");

io.to(
    room.roomCode
).emit(
    "quiz-started"
);
        res.status(200).json({
            message:"Quiz Started",
            room
        });

    }
    catch(err){

        console.log(err);

        res.status(500).json({
            message:"Server Error"
        });

    }

};
const submitRoomQuiz = async (req,res)=>{

    try{

        const { roomCode } =
            req.params;

        const { answers } =
            req.body;

        const room =
            await Room.findOne({
                roomCode
            });

        if(!room){

            return res.status(404).json({
                message:"Room not found"
            });

        }

        const quiz =
            await Quiz.findById(
                room.quizId
            );
        let score = 0;

        for(
            let i=0;
            i<quiz.questions.length;
            i++
        ){

            if(
    answers[i]?.trim()[0]
    ===
    quiz.questions[i].answer
){
    score++;
}

        }
        const existingAttempt =
        await Attempt.findOne({
            roomId: room._id,
            userId: req.user.userId
        });

        if(existingAttempt){
            return res.status(400).json({
                message:"Already submitted"
            });
        }
        await Attempt.create({

    userId:
    req.user.userId,

    quizId:
    quiz._id,

    roomId:
    room._id,

    score,

    totalQuestions:
    quiz.questions.length,

    answers

});

if(
    !room.submittedUsers.includes(
        req.user.userId
    )
){

    room.submittedUsers.push(
        req.user.userId
    );

    await room.save();

    const leaderboard =
    await Attempt.find({

        roomId:
        room._id

    })
    .populate(
        "userId",
        "name"
    )
    .sort({
        score:-1
    });

const io =
    req.app.get("io");

io.to(
    room.roomCode
).emit(
    "leaderboard-updated",
    {
        leaderboard,
        submitted:
        room.submittedUsers.length,
        total:
        room.participants.length
    }
);
    if(

    room.submittedUsers.length
    >=
    room.participants.length

){

    room.status =
        "finished";

    await room.save();
    
    await User.updateMany(

        {
            _id:{
                $in:
                room.participants
            }
        },

        {
            activeRoom:null
        }

    );
    const io =
    req.app.get("io");

        io.to(
            room.roomCode
        ).emit(
            "room-finished"
        );
}
}
        res.status(200).json({

            score,

            totalQuestions:
            quiz.questions.length

        });

    }
    catch(err){

        console.log(err);

        res.status(500).json({
            message:"Server Error"
        });

    }

};
const getRoomLeaderboard =
async (req,res)=>{

    try{

        const { roomCode } =
            req.params;

        const room =
            await Room.findOne({
                roomCode
            });

        if(!room){

            return res.status(404).json({
                message:"Room not found"
            });

        }

        const attempts =
            await Attempt.find({

                roomId:
                room._id

            })
            .populate(
                "userId",
                "name"
            )
            .sort({
                score:-1
            });

        res.status(200).json(
            attempts
        );

    }
    catch(err){

        console.log(err);

        res.status(500).json({
            message:"Server Error"
        });

    }

};
const updateDuration =
async(req,res)=>{

    try{

        const { roomCode } =
            req.params;

        const { duration } =
            req.body;

        const room =
            await Room.findOne({
                roomCode
            });

        if(!room){

            return res.status(404).json({
                message:"Room not found"
            });

        }

        if(
            room.hostId.toString()
            !==
            req.user.userId
        ){

            return res.status(403).json({
                message:"Only host can edit duration"
            });

        }

        room.duration =
            duration;

        await room.save();
        const io =
    req.app.get("io");

io.to(
    room.roomCode
).emit(
    "duration-updated",
    room.duration
);
        res.status(200).json(room);

    }
    catch(err){

        console.log(err);

        res.status(500).json({
            message:"Server Error"
        });

    }

};
const getMyRooms = async (req,res)=>{

    try{

        const rooms =
        await Room.find({

            participants:
            req.user.userId

        })
        .populate(
            "quizId",
            "title subject"
        )
        .populate(
            "hostId",
            "name"
        )
        .sort({
            createdAt:-1
        })
        .limit(5);

        res.status(200).json(
            rooms
        );

    }
    catch(err){

        console.log(err);

        res.status(500).json({
            message:"Server Error"
        });

    }

};
const finishRoom =
async(req,res)=>{

    try{

        const { roomCode } =
            req.params;

        const room =
            await Room.findOne({
                roomCode
            });

        if(!room){

            return res.status(404).json({
                message:"Room not found"
            });

        }

        room.status =
            "finished";

        await room.save();

        await User.updateMany(

            {
                _id:{
                    $in:
                    room.participants
                }
            },

            {
                activeRoom:null
            }

        );
        const io =
    req.app.get("io");

        io.to(
            room.roomCode
        ).emit(
            "room-finished"
        );
        res.status(200).json({
            message:"Room Finished"
        });

    }
    catch(err){

        console.log(err);

        res.status(500).json({
            message:"Server Error"
        });

    }

};
const getRoomAnalysis =
async(req,res)=>{

    try{
        const { roomCode } =
    req.params;
        const room =
    await Room.findOne({
        roomCode
    });

if(!room){

    return res.status(404).json({
        message:"Room not found"
    });

}

if(
    room.status !==
    "finished"
){

    return res.status(403).json({

        message:
        "Analysis available only after quiz ends"

    });

}

const isParticipant =
    room.participants.some(

        participant =>

        participant.toString()

        ===

        req.user.userId

    );

if(!isParticipant){

    return res.status(403).json({

        message:
        "Not allowed"

    });

}
        const quiz =
            await Quiz.findById(
                room.quizId
            );

        const userAttempt =
            await Attempt.findOne({

                roomId:room._id,

                userId:
                req.user.userId

            });

        if(!userAttempt){

            return res.status(404).json({
                message:
                "Attempt not found"
            });

        }

        const allAttempts =
            await Attempt.find({
                roomId:room._id
            });

        const questions =
            quiz.questions.map(
                (question,index)=>{

                    let correctCount = 0;

                    allAttempts.forEach(
                        attempt=>{

                            if(

                                attempt.answers[
                                    index
                                ]?.trim()[0]

                                ===

                                question.answer

                            ){

                                correctCount++;

                            }

                        }
                    );

                    const participants =
                        allAttempts.length;

                    return {

                        question:
                        question.question,

                        options:
                        question.options,

                        correctAnswer:
                        question.answer,

                        userAnswer:
                        userAttempt.answers[
                            index
                        ],

                        isCorrect:

                        userAttempt.answers[
                            index
                        ]?.trim()[0]

                        ===

                        question.answer,

                        correctCount,

                        participants,

                        correctPercentage:

                        participants === 0

                        ?

                        0

                        :

                        Math.round(

                            (
                                correctCount
                                /
                                participants
                            ) * 100

                        )

                    };

                }
            );

        const leaderboard =
            [...allAttempts]
            .sort(
                (a,b)=>
                b.score-a.score
            );

        const rank =
            leaderboard.findIndex(
                attempt=>

                attempt.userId.toString()

                ===

                req.user.userId

            ) + 1;

        res.status(200).json({

            score:
            userAttempt.score,

            totalQuestions:
            userAttempt.totalQuestions,

            accuracy:

            Math.round(

                (
                    userAttempt.score
                    /
                    userAttempt.totalQuestions
                ) * 100

            ),

            rank,

            participants:
            allAttempts.length,

            questions

        });

    }
    catch(err){

        console.log(err);

        res.status(500).json({
            message:"Server Error"
        });

    }

};
module.exports = {
    createRoom,
    joinRoom,
    getRoom,startRoom,submitRoomQuiz,getRoomLeaderboard,updateDuration,getMyRooms,finishRoom,getRoomAnalysis
};