const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/userModel");
const Otp = require("../models/otpModel");
const transporter = require("../middleware/emailService");

//@desc Send OTP to email
//@route POST /api/users/send-otp
//@access public
const sendOtp = asyncHandler(async (req, res) => {
  const { name: username, email, password, goal } = req.body;
  if (!goal) throw new Error("Missing data!");

  if (goal === "register") {
    if (!username || !email || !password) {
      res.status(400);
      throw new Error("All field are mandatory");
    }
  } else if (goal === "login")
    if (!email || !password) {
      throw new Error("All field are mandatory");
    }

  const userAvailable = await User.findOne({ email });

  if (userAvailable) {
    if (goal === "register") {
      res.status(400);
      throw new Error("User already registered!");
    }
  } else if (goal === "login") throw new Error("No account founded!");

  const otp = crypto.randomInt(100000, 999999).toString();

  await Otp.create({ email, otp });

  await transporter.sendMail({
    from: '"IYAKSARL.org" iyaksarl2026@gmail.com',
    to: email,
    subject: "Your Verification Code",
    text: `Your 6-digit code is: ${otp}`,
  });

  res.status(200).json({ message: "OTP sent" });
});

//@desc Verify OTP sended
//@route POST /api/users/verify-otp
//@access public
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    res.status(400);
    throw new Error("Missing data!");
  }
  const record = await Otp.findOne({ email, otp });

  if (record) {
    await Otp.deleteMany({ email }); // Delete OTP after successful use
    res.status(200).json({ message: "Email verified" });
  } else {
    res.status(400).json({ message: "Invalid or expired OTP" });
  }
});

//@desc Register a user
//@route POST /api/users/register
//@access public
const registerUser = asyncHandler(async (req, res) => {
  const { name: username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error("Missing data!");
  }
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  if (user) {
    res.status(201).json({ _id: user._id, email: user.email });
  } else {
    res.status(400);
    throw new Error("User data is not valid");
  }
});

//@desc Login a user
//@route POST /api/users/login
//@access public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("All field are mandatory!");
  }
  const user = await User.findOne({ email });

  //Compare password with hashed password
  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = jwt.sign(
      {
        user: {
          username: user.username,
          email: user.email,
          role: user.role,
          id: user._id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    );
    res.status(200).json({ accessToken });
  } else {
    res.status(401);
    throw new Error("email or password is not valid");
  }
});

//@desc Current user infos
//@route GET /api/users/current
//@access private
const currentUser = asyncHandler(async (req, res) => {
  res.json(req.user);
});

module.exports = {
  registerUser,
  loginUser,
  currentUser,
  sendOtp,
  verifyOtp,
};
