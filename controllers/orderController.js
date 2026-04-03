const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");

//@desc Get all orders
//@route GET /api/orders
//@access private (user / admin)
const getOrders = asyncHandler(async (req, res) => {
  let order;
  if (req.user.role === "admin" && req.body.option === "all")
    order = await Order.find();
  else order = await Order.find({ user_id: req.user.id });
  res.status(200).json(order);
});

//@desc Create order
//@route POST /api/orders
//@access private
const createOrder = asyncHandler(async (req, res) => {
  const { total_price, status, items } = req.body;
  if (!total_price || !status || !items) {
    res.status(400);
    throw new Error("All fields are mandatory");
  }
  const order = await Order.create({
    total_price,
    status,
    items,
    user_id: req.user.id,
  });
  res.status(201).json(order);
});

//@desc Update order
//@route PUT /api/orders/:id
//@access private (admin only)
const updateOrder = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    res.status(401);
    throw new Error("User is not authorized");
  }
  const updateOrder = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json(updateOrder);
});

//@desc Get order
//@route GET /api/orders/:id
//@access private
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  res.status(200).json(order);
});

//@desc Delete order
//@route DELETE /api/orders/:id
//@access private (admin only)
const deleteOrder = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    res.status(401);
    throw new Error("User is not authorized");
  }
  const order = await Order.findByIdAndDelete(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  res.status(200).json(order);
});

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
};
