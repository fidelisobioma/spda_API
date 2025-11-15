const express = require("express");

const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyToken,
} = require("../controllers/userController");

const router = express();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.get("/verify-token/:token", verifyToken);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
