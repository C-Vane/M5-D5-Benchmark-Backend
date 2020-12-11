const express = require("express");
const multer = require("multer");
const { writeFile, createReadStream } = require("fs-extra");
const { join } = require("path");
const { response } = require("express");

const router = express.Router();

const upload = multer({});
const ProductFilePath = join(__dirname, "./products/products.json");
const checkProduct = async (id) => {
const products = await readDB(ProductFilePath);
const productExsists = products.filter((product) => product.ID === id);
return productExsists.length > 0 ? true : false;}
const productImagePath = join(__dirname, "../../public/img");

router.post("/:id/uploadPhoto", upload.single("productImg"), async (req, res, next) => {
  console.log(req.params.id);
  console.log(req.file.originalname);
  try {
    //   if(checkProduct(req.params.id)){
    //     console.log(true)
    //    res.status(400).send("something")
    //   } else{
          await writeFile(
      join(productImagePath, req.file.originalname),
      req.file.buffer
    );
    res.send("ok");
    //   }


    
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
