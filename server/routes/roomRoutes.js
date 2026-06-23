const express = require("express");

const router = express.Router();

const authMiddleware =
require("../middleware/authMiddleware");

const {
    createRoom,joinRoom,getRoom,startRoom,submitRoomQuiz,getRoomLeaderboard,updateDuration,getMyRooms,finishRoom,getRoomAnalysis
} = require("../controllers/roomController");

router.post(
    "/create/:quizId",
    authMiddleware,
    createRoom
);
router.post(
    "/join",
    authMiddleware,
    joinRoom
);
router.post(
    "/start/:roomCode",
    authMiddleware,
    startRoom
);
router.post(
    "/submit/:roomCode",
    authMiddleware,
    submitRoomQuiz
);
router.post(
    "/finish/:roomCode",
    authMiddleware,
    finishRoom
);
router.get(
    "/leaderboard/:roomCode",
    authMiddleware,
    getRoomLeaderboard
);
router.get(
    "/my-rooms",
    authMiddleware,
    getMyRooms
);
router.get(
    "/analysis/:roomCode",
    authMiddleware,
    getRoomAnalysis
);
router.put(
    "/duration/:roomCode",
    authMiddleware,
    updateDuration
);
router.get(
    "/:roomCode",
    authMiddleware,
    getRoom
);
module.exports = router;