const express = require("express");
const uploadRoutes = require("../files/index");
const { readDB, writeDB } = require("../../lib/utilities");
const path = require("path");
const uniqid = require("uniqid");
const { check, validationResult } = require("express-validator");
const router = express.Router();

router.use("/:id/uploadPhoto", uploadRoutes);
const productFilePath = path.join(__dirname, "products.json"); //GETTING FILEPATH TO JSON

router.get("/", async (req, res, next) => {
  try {
    const productDataBase = await readDB(productFilePath); //RUNS FUNCTION TO GET DATABASE
    if (productDataBase.length > 0) {
      res.status(201).send(productDataBase); //SENDS RESPONSE WITH GOOD CODE AND WHOLE DATABSE
    } else {
      const err = {};
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (err) {
    err.httpStatusCode = 404;
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const productDataBase = await readDB(productFilePath); //RUNS FUNCTION TO GET DATABASE
    const singleProduct = productDataBase.filter(
      (product) => product.ID === req.params.id
    );
    if (singleProduct.length > 0) {
      res.status(201).send(singleProduct); //SENDS RESPONSE WITH GOOD CODE AND WHOLE DATABSE
    } else {
      const err = {};
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (err) {
    err.httpStatusCode = 404;
    next(err);
  }
});

router.post(
  "/",
  [
    check("Name")
      .exists()
      .isLength({ min: 1 })
      .withMessage("Give it a name"),
    check("Description")
      .exists()
      .isLength({ min: 1 })
      .withMessage("Give it a description"),
    check("brand")
      .exists()
      .isLength({ min: 1 })
      .withMessage("You have to give a brand for the product"),
    check("price")
      .exists()
      .isLength({ min: 1 })
      .withMessage("You need to set your price"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = {};
      err.message = errors;
      err.httpStatusCode = 400;
      next(err);
    } else {
      const productDataBase = await readDB(productFilePath); //RUNS FUNCTION TO GET DATABASE
      const newProduct = req.body; //GETS THE REQUEST BODY
      newProduct.ID = uniqid(); //GIVES BODY NEW ID
      newProduct.CreationDate = new Date(); //GIVES BODY CREATION DATE
      productDataBase.push(newProduct); //ADDS BODY TO DATABSE
      await writeDB(productFilePath, productDataBase); //OVERWRITES OLD DATABASE WITH NEW DATABASE
      res.status(201).send(productDataBase); //SENDS RESPONSE WITH GOOD CODE AND WHOLE DATABSE
    }
  }
);

router.put("/:id", async (req, res, next) => {
  try {
    const productDataBase = await readDB(productFilePath); //RUNS FUNCTION TO GET DATABASE
    const singleProduct = productDataBase.filter(
      (product) => product.ID === req.params.id
    );
    if (singleProduct.length > 0) {
      const filteredDB = productDataBase.filter(
        (product) => product.ID !== req.params.id
      );
      console.log(singleProduct);
      const editedProduct = {
        ...req.body,
        ID: singleProduct[0].ID,
        StudentID: singleProduct[0].StudentID,
        CreationDate: singleProduct[0].CreationDate,
        ModifiedDate: new Date(),
      };
      filteredDB.push(editedProduct);
      await writeDB(productFilePath, filteredDB);
      res.status(201).send(filteredDB); //SENDS RESPONSE WITH GOOD CODE AND WHOLE DATABSE
    } else {
      const err = {};
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (err) {
    err.httpStatusCode = 404;
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const productDataBase = await readDB(productFilePath); //RUNS FUNCTION TO GET DATABASE
    const singleProduct = productDataBase.filter(
      (product) => product.ID === req.params.id
    );
    if (singleProduct.length > 0) {
      const filteredDB = productDataBase.filter(
        (product) => product.ID !== req.params.id
      );
      await writeDB(productFilePath, filteredDB);
      res.status(201).send(filteredDB); //SENDS RESPONSE WITH GOOD CODE AND WHOLE DATABSE
    } else {
      const err = {};
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (err) {
    err.httpStatusCode = 404;
    next(err);
  }
});

module.exports = router;
