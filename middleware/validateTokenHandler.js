const asyncHandler = require("express-async-handler");

const jwt = require("jsonwebtoken");

const validateToken = asyncHandler(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    res.status(401);
    throw new Error("User is not authorized or token is missing");
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      res.status(401);
      throw new Error("User is not authorized");
    }

    const admin = decoded.admin;
    const user = decoded.user;

    req.user = Boolean(user) ? user : admin;
    next();
  });
});

module.exports = validateToken;
