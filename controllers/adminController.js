const asyncHandler = require("express-async-handler");
const Admin = require("../models/adminModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

//@desc Login admin
//@route POST /api/admin/login
//@access private
const loginAdmin = asyncHandler(async (req, res) => {
  const { key, password } = req.body;
  const admin = await Admin.findOne({ isadmin: true });
  if (!admin) {
    res.status(404);
    throw new Error("Admin not found");
  }

  const isPasswordMatch = await bcrypt.compare(password, admin.password);

  const isKeyMatch = await bcrypt.compare(key, admin.key);

  if (!isPasswordMatch || !isKeyMatch) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const accessToken = jwt.sign(
    {
      admin: {
        username: admin.username,
        email: admin.email,
        isadmin: admin.isadmin,
        _id: admin._id,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" },
  );

  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(200).json({ message: "Token generated" });
});

const getAllUsers = asyncHandler(async (req, res) => {
  if (!req.user.isadmin) {
    res.status(401);
    throw new Error("Admin is not authorized");
  }
  const users = await User.find();
  res.status(200).json(users);
});

const getUser = asyncHandler(async (req, res) => {
  if (!req.user.isadmin) {
    res.status(401);
    throw new Error("Admin is not authorized");
  }
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json(user);
});

module.exports = {
  loginAdmin,
  getAllUsers,
  getUser,
};

// (async function () {
//   const password = await bcrypt.hash("yukio@.36303", 10);
//   const key = await bcrypt.hash("K68YR", 10);
//   await Admin.create({ password, key });
// })();
