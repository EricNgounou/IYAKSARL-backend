const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const {
  processUpload,
  processDelete,
} = require("../utils/express-cloud/cloudController");

//@desc Get all products
//@route GET /api/products
//@access public
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();
  if (!products) {
    res.status(404);
    throw new Error("Products not found");
  }
  res.status(200).json(products);
});

//@desc Create new product
//@route POST /api/products
//@access private (admin only)
const createProduct = asyncHandler(async (req, res) => {
  if (!req.user.isadmin) {
    res.status(401);
    throw new Error("User is not authorized");
  }

  const {
    name,
    price,
    category,
    subcategory,
    description,
    instock,
    imgAltTexts,
  } = req.body;
  if (
    !name ||
    !price ||
    !category ||
    !subcategory ||
    !description ||
    !instock ||
    !imgAltTexts
  ) {
    res.status(400);
    throw new Error("All fields are mandatory !");
  }
  const imgUrls = await processUpload(req, res);
  const parsedDescription = JSON.parse(description);

  const product = await Product.create({
    name,
    price,
    category,
    subcategory,
    description: parsedDescription,
    instock,
    imgurls: imgUrls,
  });

  if (!product) {
    throw new Error("Failed to create product");
  }
  res.status(201).json({ message: "Product created successfully", product });
});

//@desc Get product
//@route GET /api/products/:id
//@access public
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.status(200).json(product);
});

//@desc Update product
//@route PUT /api/products/:id
//@access private  (admin only)
const updateProduct = asyncHandler(async (req, res) => {
  if (!req.user.isadmin) {
    res.status(401);
    throw new Error("User is not authorized");
  }

  const { id } = req.params;

  let { updates } = req.body;
  updates = JSON.parse(updates);

  if (Object.hasOwn(updates, "imgurls")) {
    await processDelete(req, res);
    const isImgAdded = Boolean(req.files && req.files.length);
    if (isImgAdded) {
      const imgUrls = await processUpload(req, res);
      updates.imgurls.push(...imgUrls);
    }
  }

  const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
    new: true,
  });

  if (!updatedProduct) {
    throw new Error("Failed to update product!");
  }

  res
    .status(200)
    .json({ message: `Successfully uploaded product ${id}`, updatedProduct });
});

//@desc Delete product
//@route DELETE /api/products/:id
//@access private (admin only)
const deleteProduct = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    res.status(401);
    throw new Error("User is not authorized");
  }

  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Contact not found");
  }

  res.status(200).json(product);
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
