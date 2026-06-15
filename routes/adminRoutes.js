const express = require("express");

const {
  loginAdmin,
  getAllUsers,
  getUser,
} = require("../controllers/adminController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/all-users", validateToken, getAllUsers);
router.get("/users/:id", validateToken, getUser);

module.exports = router;
