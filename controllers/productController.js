const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
//@desc Get all products
//@route GET /api/products
//@access public
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();
  res.status(200).json(products);
});

//@desc Create new product
//@route POST /api/products
//@access private (admin only)
const createProduct = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    res.status(401);
    throw new Error("User is not authorized");
  }

  const { price, name, category, description, img_url, stock, sales } =
    req.body;
  if (
    !name ||
    !price ||
    !category ||
    !description ||
    !img_url ||
    !stock ||
    !sales
  ) {
    res.status(400);
    throw new Error("All fields are mandatory !");
  }
  const product = await Product.create({
    price,
    name,
    category,
    sub_category: req.body.sub_category,
    description,
    img_url,
    stock,
    sales,
  });
  res.status(201).json(product);
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
  if (req.user.role !== "admin") {
    res.status(401);
    throw new Error("User is not authorized");
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.status(200).json(updatedProduct);
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
