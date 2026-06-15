const mongoose = require("mongoose");

const orderItemSchema = mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    product_id: {
      type: String,
      require: true,
    },
    product_name: { type: String, require: true },
    quantity: {
      type: Number,
      require: true,
    },
    unit_price: { type: Number, require: true },
    sub_total: { type: Number, require: true },
    img_url: { type: Object, require: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("OrderItem", orderItemSchema);
