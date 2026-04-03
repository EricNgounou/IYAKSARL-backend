const mongoose = require("mongoose");

const orderItemSchema = mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
    },
    sub_total: { type: String, require: true },
    quantity: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("orderItem", orderItemSchema);
