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

router.use(validateToken);
router.route("/").get(getOrders).post(createOrder);
router.route("/:id").put(updateOrder).get(getOrder).delete(deleteOrder);

module.exports = router;
