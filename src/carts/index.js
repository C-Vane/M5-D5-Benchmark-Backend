const express = require("express");
const uploadRoutes = require("../files/index");
const { readDB, writeDB } = require("../../lib/utilities");
const path = require("path");
const uniqid = require("uniqid");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const CartsFilePath = path.join(__dirname, "carts.json");
const ProductsFilePath = path.join(__dirname, "../products/products.json");
const getSingleCart = (carts, id) => carts.filter((cart) => cart._id === id);
const getSingleCartIndex = (carts, id) => carts.findIndex((cart) => cart._id === id);

const getSingleProduct = (products, id) => products.filter((product) => product.ID === id);
router.get("/:cartId", async (req, res, next) => {
  try {
    const carts = await readDB(CartsFilePath);
    const filterCarts = getSingleCart(carts, req.params.cartId);
    res.send(filterCarts);
  } catch (error) {
    next(error);
  }
});
router.post("/:cartId/add-to-cart/:productId", async (req, res, next) => {
  const carts = await readDB(CartsFilePath);
  const products = await readDB(ProductsFilePath);
  const cartIndex = getSingleCartIndex(carts, req.params.cartId);
  const product = getSingleProduct(products, req.params.productId)[0];
  if (cartIndex !== -1 && product) {
    carts[cartIndex].products.push({
      name: product.name,
      descriptoin: product.description,
      ID: product.ID,
      price: product.price,
      image: product.image,
      addedDate: new Date(),
    });
    carts[cartIndex].total = carts[cartIndex].total + parseFloat(product.price);
    await writeDB(CartsFilePath, carts);
    res.status(201).send(carts);
  } else {
    const error = new Error();
    error.httpStatusCode = 404;
    error.message = "Cart not found";
    next(error);
  }
});
router.delete("/:cartId/remove-from-cart/:productId", async (req, res, next) => {
  const carts = await readDB(CartsFilePath);
  const cartIndex = getSingleCartIndex(carts, req.params.cartId);
  const product = getSingleProduct(carts[cartIndex].products, req.params.productId)[0];
  if (cartIndex !== -1 && product) {
    carts[cartIndex].products = carts[cartIndex].products.filter((product) => product.ID !== req.params.productId);
    console.log(carts[cartIndex].total);
    carts[cartIndex].total = carts[cartIndex].total - parseFloat(product.price);
    console.log(carts[cartIndex].total, product.price);
    await writeDB(CartsFilePath, carts);
    res.status(201).send(carts);
  } else {
    const error = new Error();
    error.httpStatusCode = 404;
    error.message = "Cart not found";
    next(error);
  }
});
module.exports = router;
