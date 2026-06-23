const express = require("express");

const router = express.Router();
const authMiddleware =
require("../middleware/authMiddleware");
const {signup,login,getMe,getActiveRoom,} = require("../controllers/authController");

router.post("/signup",signup);
router.post("/login", login);
router.get(
   "/me",
   authMiddleware,
   getMe
);
router.get(
    "/active-room",
    authMiddleware,
    getActiveRoom
);
module.exports = router;