const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    subcategory: {
      type: String,
      default: null,
    },
    price: { type: Number, required: true },
    instock: {
      type: Number,
      require: true,
    },
    imgurls: [
      {
        thumbnailUrlWEBP: String,
        thumbnailUrlJPEG: String,
        thumbnailUrlAVIF: String,
        mainUrlWEBP: String,
        mainUrlJPEG: String,
        mainUrlAVIF: String,
        altText: String,
        isDefault: Boolean,
        isUploaded: Boolean,
      },
    ],
    description: [
      {
        type: Object,
        require: [true, "At least one description"],
      },
    ],
    sales: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
