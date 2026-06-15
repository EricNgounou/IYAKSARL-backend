const express = require("express");
const {
  getOrders,
  createOrder,
  updateOrder,
  getOrder,
  deleteOrder,
} = require("../controllers/orderController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.route("/").get(validateToken, getOrders).post(createOrder);
router
  .route("/:id")
  .put(validateToken, updateOrder)
  .get(validateToken, getOrder)
  .delete(validateToken, deleteOrder);

module.exports = router;
