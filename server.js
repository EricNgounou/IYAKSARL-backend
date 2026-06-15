const express = require("express");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const { connectDb, connectLocalDb } = require("./config/dbConnection");
const app = express();
const dotenv = require("dotenv").config();
const cors = require("cors");

if (process.env.NODE_ENV === "development") connectLocalDb();
else if (process.env.NODE_ENV === "production") connectDb();
const port = process.env.PORT || 5000;

app.use(cookieParser());
app.use(
  cors({
    origin: process.env.ORIGIN_CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/otp", require("./routes/otpRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/orderItems", require("./routes/orderItemRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
