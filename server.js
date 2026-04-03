const express = require("express");
const errorHandler = require("./middleware/errorHandler");
const { connectDb, connectLocalDb } = require("./config/dbConnection");
const app = express();
const dotenv = require("dotenv").config();
const cors = require("cors");

connectLocalDb();
// connectDb();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/orderItems", require("./routes/orderItemRoutes"));
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
