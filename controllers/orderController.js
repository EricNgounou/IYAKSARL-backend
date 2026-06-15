const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");
const OrderItem = require("../models/orderItemModel");
const Product = require("../models/productModel");

//@desc Get all orders
//@route GET /api/orders
//@access private (user / admin)
const getOrders = asyncHandler(async (req, res) => {
  if (!req.user.isadmin) {
    res.status(401);
    throw new Error("User is not authorized");
  }

  const orders = await Order.find();

  if (!orders) {
    res.status(404);
    throw new Error("Orders not found");
  }
  res.status(200).json(orders);
});

//@desc Create order
//@route POST /api/orders
//@access public
const createOrder = asyncHandler(async (req, res) => {
  const { order, items } = req.body;
  if (!order || !items) {
    res.status(400);
    throw new Error("Missing data");
  }
  const createdOrder = await Order.create(order);
  if (createdOrder) {
    const itemsUploadInitTasks = items.map(async (item) => {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product_id,
          instock: { $gte: item.quantity }, // Condition: stock must be >= quantity
        },
        {
          $inc: {
            sales: item.quantity,
            instock: -item.quantity,
          },
        },
        { new: true },
      );

      if (!updatedProduct) {
        await Order.findByIdAndDelete(createdOrder._id);
        res.status(404);
        throw new Error(
          "Product not found or insufficient stock for product ID: " +
            item.product_id,
        );
      }

      item.order_id = createdOrder._id;
    });

    await Promise.all(itemsUploadInitTasks);
    const createItems = await OrderItem.create(items);
    if (createItems) {
      res
        .status(201)
        .json({ _id: createdOrder._id, message: "Order successfully created" });
    } else {
      res.status(400);
      throw new Error("Invalid data");
    }
  } else {
    res.status(400);
    throw new Error("Invalid data");
  }
});

//@desc Update order
//@route PUT /api/orders/:id
//@access private (admin only)
const updateOrder = asyncHandler(async (req, res) => {
  if (!req.user.isadmin) {
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
