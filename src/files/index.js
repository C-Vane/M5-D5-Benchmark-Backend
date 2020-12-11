const express = require("express");
const multer = require("multer");
const { writeFile, createReadStream } = require("fs-extra");
const { join } = require("path");

const router = express.Router();

const upload = multer({});

const productImagePath = join(__dirname, "../../public/img");

router.post("/", upload.single("productImg"), async (req, res, next) => {
  console.log(req.params.id);
  console.log(req.file.originalname);
  try {
    await writeFile(
      join(productImagePath, req.file.originalname),
      req.file.buffer
    );
    res.send("ok");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
