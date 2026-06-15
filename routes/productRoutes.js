const express = require("express");
const router = express.Router();
const multer = require("multer");

const storage = multer.memoryStorage(); // Keep binary file in memory as a buffer for Sharp to process
const upload = multer({
  storage: storage,
});

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const validateToken = require("../middleware/validateTokenHandler");

router
  .route("/")
  .get(getProducts)
  .post(validateToken, upload.array("images", 6), createProduct);
router
  .route("/:id")
  .get(getProduct)
  .put(validateToken, upload.array("images", 6), updateProduct)
  .delete(validateToken, deleteProduct);

module.exports = router;
