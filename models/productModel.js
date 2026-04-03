const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add the product name"],
    },
    price: { type: String, required: [true, "Please add the product price"] },
    category: {
      type: String,
      required: [true, "Please add the product category"],
    },
    sub_category: {
      type: String,
      default: null,
    },
    img_url: {
      type: String,
      required: [true, "Please add the product image"],
    },
    stock: {
      type: Number,
      require: [true, "please add the product stock"],
    },
    sales: {
      type: Number,
      require: [true, "please add the number of sales"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("product", productSchema);
