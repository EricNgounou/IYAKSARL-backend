const express = require("express");
const validateToken = require("../middleware/validateTokenHandler");
const {
  getOrderItems,
  createOrderItems,
  getOrderItem,
  updateOrderItems,
  deleteOrderItems,
} = require("../controllers/orderItemController");
const router = express.Router();

router.use(validateToken);
router.route("/").get(getOrderItems).post(createOrderItems);
router
  .route("/:id")
  .get(getOrderItem)
  .put(updateOrderItems)
  .delete(deleteOrderItems);

module.exports = router;
