const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    total_items: { type: Number, require: true },
    total_items_amount: { type: Number, require: true },
    total_amount: { type: Number, require: true },
    delivery_infos: { type: Object, require: true },
    customer_status: { type: String, require: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
