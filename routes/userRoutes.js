const express = require("express");
const {
  registerUser,
  loginUser,
  currentUser,
  logoutUser,
  updateUser,
  validateUpdates,
} = require("../controllers/userController");
const validateToken = require("../middleware/validateTokenHandler");
const { validateOtp } = require("../controllers/otpController");

const router = express.Router();

router.post("/register", validateOtp, registerUser);

router.post("/login", validateOtp, loginUser);

router.post("/logout", logoutUser);

router.get("/current", validateToken, currentUser);

router.put("/update", validateToken, updateUser, loginUser);

router.post("/validate-updates", validateToken, validateUpdates);

module.exports = router;
