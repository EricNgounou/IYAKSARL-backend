const mongoose = require("mongoose");

const adminSchema = mongoose.Schema(
  {
    username: {
      type: String,
      default: "Admin",
    },
    email: {
      type: String,
      default: "admin@example.com",
    },
    key: { type: String, required: [true, "Please add the admin key"] },
    password: {
      type: String,
      required: [true, "Please add the admin password"],
    },

    isadmin: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Admin", adminSchema);
