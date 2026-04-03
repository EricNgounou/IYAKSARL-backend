const asyncHandler = require("express-async-handler");
const OrderItem = require("../models/orderItemModel");

//@desc Get orderItems
//@route GET /api/orderItems
//@access private (user / admin)
const getOrderItems = asyncHandler(async (req, res) => {
  let orderItem;
  if (req.user.role === "admin" && req.body.option === all)
    orderItem = await OrderItem.find();
  else order = await OrderItem.find({ order_id: req.body.order_id });
  res.status(200).json(orderItem);
});

//@desc Get orderItem
//@route GET /api/orderItems/:id
//@access private
const getOrderItem = asyncHandler(async (req, res) => {
  const orderItem = await OrderItem.findById(req.params.id);
  if (!orderItem) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.status(200).json(orderItem);
});

//@desc Create orderItem
//@route POST /api/orderItems
//@access private
const createOrderItems = asyncHandler(async (req, res) => {
  const { order_id, product_id, quantity, sub_total } = req.body;
  if (!order_id || !product_id || !quantity || !sub_total) {
    res.status(400);
    throw new Error("All field are mandatory");
  }
  const orderItem = await OrderItem.create({
    order_id,
    product_id,
    quantity,
    sub_total,
  });

  res.status(201).json(orderItem);
});

//@desc Update orderItem
//@route PUT /api/orderItems/:id
//@access private
const updateOrderItems = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    res.status(401);
    throw new Error("User is not authorized");
  }

  const updateOrderItem = await OrderItem.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.status(200).json(updateOrderItem);
});

//@desc Delete orderItem
//@route DELETE /api/orderItems/:id
//@access private
const deleteOrderItems = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    res.status(401);
    throw new Error("User is not authorized");
  }
  const orderItem = await OrderItem.findByIdAndDelete(req.params.id);

  res.status(200).json(orderItem);
});

module.exports = {
  getOrderItems,
  getOrderItem,
  createOrderItems,
  updateOrderItems,
  deleteOrderItems,
};
