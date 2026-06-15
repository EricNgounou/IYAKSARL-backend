const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    const connect = await mongoose.connect(process.env.CONNECTION_STRING);
    console.log(
      "Connected to remote MongoDB :",
      connect.connection.host,
      connect.connection.name,
    );
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

const connectLocalDb = async () => {
  try {
    const connect = await mongoose.connect(process.env.LOCAL_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(
      "Connected to local MongoDB",
      connect.connection.host,
      connect.connection.name,
    );

    console.log("Data base is running..");
  } catch (err) {
    console.log("MongoDB connection error:", err);
  }
};

module.exports = { connectDb, connectLocalDb };
