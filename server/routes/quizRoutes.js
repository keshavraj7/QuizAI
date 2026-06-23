const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload =require("../middleware/uploadMiddleware");
const {
    createQuiz,
    getMyQuizzes,
    addQuestion,
    getQuizById,
    submitQuiz,
    generateQuiz,
    getLeaderboard
} = require("../controllers/quizController");

router.post(
    "/create",
    authMiddleware,
    createQuiz
);
router.post(
    "/:id/question",
    authMiddleware,
    addQuestion
);
router.post(
    "/:id/submit",
    authMiddleware,
    submitQuiz
);

router.get(
  "/my-quizzes",
  authMiddleware,
  getMyQuizzes
);
router.get(
    "/:id",
    authMiddleware,
    getQuizById
);
router.post(
    "/generate",
    authMiddleware,
    upload.array("files"),
    generateQuiz
);
router.get(
    "/:id/leaderboard",
    authMiddleware,
    getLeaderboard
);
module.exports = router;