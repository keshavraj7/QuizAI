const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Quiz = require("../models/Quiz");
const Attempt = require("../models/Attempt");
const Room = require("../models/Room");
const getMe = async(req,res)=>{

    try{

        const user =
            await User.findById(
                req.user.userId
            ).select("-password");

        const createdQuizzes =
            await Quiz.countDocuments({
                createdBy:req.user.userId
            });
            const roomsHosted =
await Room.countDocuments({
  hostId:req.user.userId
});

const roomsJoined =
await Room.countDocuments({
  participants:req.user.userId
});
        const attemptedQuizzes =
            await Attempt.countDocuments({
                userId:req.user.userId
            });
            const attempts =
await Attempt.find({
  userId:req.user.userId
});

let bestScore = 0;
let averageScore = 0;

if(attempts.length){

 const percentages =
attempts.map(a =>

  a.totalQuestions > 0

  ?

  (
    a.score /
    a.totalQuestions
  ) * 100

  :

  0

);

  bestScore =
    Math.max(...percentages);

  averageScore =
    percentages.reduce(
      (a,b)=>a+b,
      0
    ) / percentages.length;

}
        res.status(200).json({

            ...user.toObject(),

            createdQuizzes,

            attemptedQuizzes,roomsHosted,
roomsJoined,
bestScore:
Math.round(bestScore),

averageScore:
Math.round(averageScore)

        });

    }
    catch(err){

        res.status(500).json({
            message:"Server Error"
        });

    }

};
//login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Login Successful",
      token,
    userId:user._id
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

//signup
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User created successfully",
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
const getActiveRoom =
async(req,res)=>{

    try{

        const user =
        await User.findById(
            req.user.userId
        )
        .populate({

            path:"activeRoom",

            populate:{
                path:"quizId",
                select:"title"
            }

        });

        res.status(200).json(
            user.activeRoom
        );

    }
    catch(err){

        console.log(err);

        res.status(500).json({
            message:"Server Error"
        });

    }

};
module.exports = {
  signup,
  login,getMe,getActiveRoom
};