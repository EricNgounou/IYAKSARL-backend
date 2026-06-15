const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../models/userModel");
const Otp = require("../models/otpModel");
const {
  transporter,
  brevoEmailSender,
} = require("../utils/email/emailService");
const { generateEmailHtmlContent } = require("../utils/email/helpers");
const NODE_ENV = process.env.NODE_ENV || "development";
//@desc Send OTP to email
//@route POST /api/users/send-otp
//@access public
const sendOtp = asyncHandler(async (req, res) => {
  const { email, password, process: processName, otp_message } = req.body;
  const allowedProcessReg = /^register|login|auth_current|auth_new$/;
  if (!processName || !allowedProcessReg.test(processName)) {
    res.status(400);
    throw new Error("Missing or invalid process!");
  }

  if (processName === "register" || processName === "login") {
    if (!email || !password) {
      res.status(400);
      throw new Error("Email and Password field are mandatory");
    }
  }

  if (
    processName === "register" ||
    processName === "login" ||
    processName === "auth_new"
  ) {
    const userAvailable = await User.findOne({ email });
    // Check if user is available for both register and login process
    if (userAvailable) {
      if (processName === "register" || processName === "auth_new") {
        // If user is available for register / auth_new process, an error is throwed
        res.status(400);
        throw new Error(
          `${processName === "register" ? "User already registered!" : "This email already has an account"}`,
        );
      } else {
        // If user is available for login process, check if password match with hashed password
        if (!(await bcrypt.compare(password, userAvailable.password))) {
          res.status(401);
          throw new Error("Email or Password is not valid");
        }
      }
    } else if (process === "login") {
      // If user not available for login process, an error is throwed
      res.status(400);
      throw new Error("No account founded!");
    }
  }

  const otp = crypto.randomInt(100000, 999999).toString();

  if (NODE_ENV === "production") {
    // Use Brevo email service in production
    await brevoEmailSender({
      email,
      subject: "Verification Code",
      html: generateEmailHtmlContent(processName, otp, otp_message),
    });
  }

  // await transporter.sendMail({
  //   from: '"IYAKSARL" ',
  //   to: ,
  //   subject: "Verification Code",
  //   text: ,
  // });

  await Otp.create({ email, otp });
  res.status(200).json({ message: "OTP sent" });
});

//@desc Verify OTP sended
//@route POST /api/users/register or POST /api/users/login
//@access public
const validateOtp = asyncHandler(async (req, res, next) => {
  const { name, email, password, otp, process } = req.body;
  if (!email || !otp) {
    res.status(400);
    throw new Error("Missing data!");
  }
  const record = await Otp.findOne({ email, otp });

  if (record) {
    await Otp.deleteMany({ email }); // Delete OTP after successful use
    const data = {
      name,
      email,
    };
    if (process === "register") {
      data.password = password;
    }

    if (process === "auth_current" || process === "auth_new") {
      res.status(200).json({ message: "Email verified." });
    } else {
      req.user = data;
      next();
    }
  } else {
    res.status(400).json({ message: "Invalid or expired OTP" });
  }
});

module.exports = { sendOtp, validateOtp };
