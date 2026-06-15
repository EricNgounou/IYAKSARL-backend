const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const OrderItem = require("../models/orderItemModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//@desc Register a user
//@route POST /api/users/register
//@access public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.user;

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  const username = name || email.slice(0, email.indexOf("@"));
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  if (user) {
    res
      .status(201)
      .json({ _id: user._id, email: user.email, name: user.username });
  } else {
    res.status(400);
    throw new Error("User data is not valid");
  }
});

//@desc Login a user
//@route POST /api/users/login
//@access public
const loginUser = asyncHandler(async (req, res) => {
  const { email } = req.user;

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User data is not valid");
  }
  const { username, _id, isadmin } = user;
  const accessToken = jwt.sign(
    {
      user: {
        username,
        email,
        isadmin,
        _id,
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

//@desc Logout a user
//@route POST /api/users/logout
//@access public
const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 0,
  });
  res.status(200).json({ message: "Logged out successfuly" });
});

//@desc Current user infos
//@route GET /api/users/current
//@access private
const currentUser = asyncHandler(async (req, res) => {
  const userInfo = req.user;
  const orders = await Order.find({ user_id: userInfo._id }).lean();
  if (!orders) {
    res.status(400);
    throw new Error("Failed to get orders");
  }

  for (const order of orders) {
    const items = await OrderItem.find({ order_id: order._id });
    if (!items) {
      res.status(400);
      throw new Error("Failed to get items");
    }
    order.items = items;
  }

  res.status(200).json({ userInfo, orders });
});

//@desc Update user infos
//@route PUT /api/users/update
//@access private
const updateUser = asyncHandler(async (req, res, next) => {
  const { updatedData, password: rawPassword } = req.body;
  const { _id, email: userEmail } = req.user;

  const user = await User.findOne({ email: userEmail });

  if (!(await bcrypt.compare(rawPassword, user.password))) {
    res.status(401);
    throw new Error("Updates failed! (Wrong password).");
  }

  const { username, email, password } = updatedData;

  if (username) {
    updatedData.username = username.next;
  }

  if (email) {
    updatedData.email = email.next;
  }

  if (password) {
    const hashedPassword = await bcrypt.hash(password.next, 10);
    updatedData.password = hashedPassword;
  }

  const updatedUser = await User.findByIdAndUpdate(
    _id,
    { $set: updatedData },
    { new: true, runValidators: true },
  );

  if (!updatedUser) {
    res.status(400);
    throw new Error("Failed to update.");
  }

  req.user = { email: updatedUser.email };

  next();
});

//@desc validate a user infos updates
//@route POST /api/users/validate-updates
//@access private

const validateUpdates = asyncHandler(async (req, res) => {
  const updatedData = req.body;
  const { _id, email } = req.user;

  if (updatedData.password) {
    const user = await User.findOne({ email });
    const {
      password: { current },
    } = updatedData;
    if (!(await bcrypt.compare(current, user.password))) {
      res.status(401);
      throw new Error("Old password does not match.");
    }
  }

  res.status(200).json(updatedData);
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  currentUser,
  updateUser,
  validateUpdates,
};
