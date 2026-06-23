const Quiz = require("../models/Quiz");
const Attempt = require("../models/Attempt");
const model = require("../services/geminiService");
const pdfParse =
require("pdf-parse");
const officeParser =
require("officeparser");


async function generateWithRetry(prompt){

    let retries = 3;

    while(retries--){

        try{

            const result =
                await model.generateContent(
                    prompt
                );

            return result;

        }
        catch(err){

            console.log(
                "Gemini Error:",
                err.message
            );

            if(retries === 0)
                throw err;

            await new Promise(
                resolve =>setTimeout(
                        resolve,
                        3000
                    )
            );

        }

    }

}

const createQuiz = async (req,res) => {

    try{

        const {title,subject,difficulty} = req.body;

        if(!title || !subject || !difficulty){
            return res.status(400).json({
                message:"All fields are required"
            });
        }

        const quiz = await Quiz.create({
            title,
            subject,
            difficulty,
            createdBy:req.user.userId
        });

        res.status(201).json({
            message:"Quiz Created",
            quiz
        });

    }
    catch(err){

        console.log(err);

        res.status(500).json({
            message:"Server Error"
        });
    }
};
const getMyQuizzes = async (req, res) => {
  try {

    const quizzes = await Quiz.find({
      createdBy: req.user.userId
    });

    res.status(200).json(quizzes);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server Error"
    });

  }
};

const addQuestion = async (req, res) => {
    try {

        const { id } = req.params;

        const {
            question,
            options,
            answer
        } = req.body;

        const quiz = await Quiz.findById(id);

        if (!quiz) {
            return res.status(404).json({
                message: "Quiz not found"
            });
        }

        quiz.questions.push({
            question,
            options,
            answer
        });

        await quiz.save();

        res.status(200).json({
            message: "Question Added",
            quiz
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Server Error"
        });

    }
};
const getQuizById = async (req,res)=>{
    try{

        const quiz = await Quiz.findById(req.params.id);

        if(!quiz){
            return res.status(404).json({
                message:"Quiz not found"
            });
        }

        res.status(200).json(quiz);

    }
    catch(err){
        res.status(500).json({
            message:"Server Error"
        });
    }
}
const submitQuiz = async (req,res)=>{
    try{

        const { id } = req.params;
        const { answers } = req.body;

        const quiz = await Quiz.findById(id);

        if(!quiz){
            return res.status(404).json({
                message:"Quiz not found"
            });
        }

        let score = 0;

        for(let i=0;i<quiz.questions.length;i++){

            if(
                answers[i] ===
                quiz.questions[i].answer
            ){
                score++;
            }
        }

        const attempt =
            await Attempt.create({

                userId:req.user.userId,
                quizId:id,
                score,
                totalQuestions:
                    quiz.questions.length,
                answers

            });

        res.status(200).json({
            score,
            totalQuestions:
                quiz.questions.length
        });

    }catch(err){

        console.log(err);

        res.status(500).json({
            message:"Server Error"
        });

    }
};
const generateQuiz = async (req, res) => {

    try {

        const {
            title,
            subject,
            difficulty,
            numberOfQuestions,
            instructions
        } = req.body;

        let studyMaterial = "";
        let uploadedFileNames = [];

        if (req.files && req.files.length > 0) {

            for (const file of req.files) {
                const extension =file.originalname.split(".").pop().toLowerCase();
                    if(extension === "pdf"){
                        const data =await pdfParse(file.buffer);
                        studyMaterial +=data.text;
                    }
                    else if(extension === "pptx"){
                        const text =await officeParser.parseOfficeAsync(file.buffer
                        );
                        studyMaterial +=text;
                    }
                    else{
                        studyMaterial+=file.originalname;
                        
                    }
                uploadedFileNames.push(file.originalname);
            }

        } else {
            studyMaterial =
                subject;
        }
    
        const prompt = `
You are an expert educator.

Study Material:

${studyMaterial}

Additional Instructions:

${instructions || "None"}

Difficulty:
${difficulty}

Generate ${numberOfQuestions} multiple-choice questions.

Rules:

1. Questions must be unique.
2. Each question must have exactly 4 options.
3. Only one option should be correct.
4. Make options realistic and non-obvious.
5. Cover multiple important concepts.
6. If study material is provided, generate questions ONLY from it.
7. Follow the additional instructions.
8. Return ONLY valid JSON array.
9. No markdown.
10. No explanations.

Output Format:

[
  {
    "question":"Question text",
    "options":[
      "A. Option 1",
      "B. Option 2",
      "C. Option 3",
      "D. Option 4"
    ],
    "answer":"A"
  }
]

`;
        const result =await generateWithRetry(prompt);
        const response =await result.response;
        const text =
            response.text();
        const cleanText =
            text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
        const questions =
            JSON.parse(
                cleanText
            );
        const quiz =
            await Quiz.create({
                title,
                subject:
                    uploadedFileNames.length > 0
                    ? uploadedFileNames.join(", ")
                    : subject,
                difficulty,
                questions,
                createdBy:
                    req.user.userId
            });
        res.status(201).json({
            message:
                "Quiz Generated",
            quiz
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message:
                err.message
        });
    }
};
const getLeaderboard = async (req,res)=>{
    try{

        const { id } = req.params;

        const attempts =
            await Attempt.find({
                quizId:id
            })
            .populate(
                "userId",
                "name email"
            )
            .sort({
                score:-1
            });

        res.status(200).json(attempts);

    }
    catch(err){

        console.log(err);

        res.status(500).json({
            message:"Server Error"
        });

    }
};
module.exports = {
    createQuiz,
    getMyQuizzes,
    addQuestion,
    getQuizById,
    submitQuiz,
    generateQuiz,
    getLeaderboard
};