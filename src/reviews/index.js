const express = require("express");
const uniqid = require("uniqid");
const router = express.Router();
const path = require("path");
const { check, validationResult } = require("express-validator");
const { readDB, writeDB } = require("../lib/utilites");
const { writeFile } = require("fs-extra");

const ReviewsFilePath = path.join(__dirname, "reviews.json");
//const ProductsFilePath = path.join(__dirname, "./products/products.json");
/*
const checkProduct = async (id) => {
  const products = await readDB(ProductsFilePath);
  console.log("hello");
  const productExsists = products.find((product) => product.ID === id);

  return productExsists ? false : true;
};*/

//GET reviews
router.get("/:id", async (req, res, next) => {
  try {
    const reviews = await readDB(ReviewsFilePath);
    const filterReviews = reviews.filter((review) => review.elementId === req.params.id);
    res.send(filterReviews);
  } catch (error) {
    next(error);
  }
});
//POST reviews
router.post(
  "/:id",
  [check("comment").exists().withMessage("Add a comment please!"), check("rate").isInt({ gt: 1, lt: 6 }).withMessage("Rate should be from 1-5").exists.apply("Add a rating Please!")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const err = new Error();
        err.message = errors;
        err.httpStatusCode = 400;
        next(err);
      } else {
        const reviewsDB = await readDB(ReviewsFilePath);
        const newreview = {
          ...req.body,
          _id: uniqid(),
          createdAt: new Date(),
        };

        reviewsDB.push(newreview);

        await writeDB(ReviewsFilePath, reviewsDB);

        res.status(201).send({ id: newreview._id });
      }
    } catch (error) {
      next(error);
    }
  }
);

//PUT reviews

router.put(
  "/:prodid/:id",
  [check("comment").exists().withMessage("Add a comment please!"), check("rate").isInt({ gt: 1, lt: 6 }).withMessage("Rate should be from 1-5").exists.apply("Add a rating Please!")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty() || checkProduct(req.body.elementId)) {
        const err = new Error();
        err.message = errors;
        err.httpStatusCode = 400;
        next(err);
      } else {
        const reviewsDB = await readDB(ReviewsFilePath);
        const newDb = reviewsDB.filter((review) => review.ID !== req.params.id);

        const modifiedReview = {
          ...req.body,
          _id: req.params.id,
          modifiedAt: new Date(),
        };

        newDb.push(modifiedReview);
        await writeDB(ReviewsFilePath, newDb);

        res.status(201).send({ id: newreview._id });
      }
    } catch (error) {
      next(error);
    }
  }
);

//Delete reviews

router.delete("/:prodid/reviews/:id/", async (req, res, next) => {
  try {
    const reviewsDB = await readDB(ReviewsFilePath);
    const newDb = reviewsDB.filter((review) => review._id !== req.params.id);
    await writeDB(ReviewsFilePath, newDb);
    res.status(204).send();
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
