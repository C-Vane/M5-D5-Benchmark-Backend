const express = require("express");
const multer = require("multer");
const { writeFile, createReadStream } = require("fs-extra");
const { join} = require("path");
const path = require("path")
const { response } = require("express");
const { readDB, writeDB } = require("../../lib/utilities");

const router = express.Router();

const upload = multer({});
const ProductFilePath = join(__dirname, "../products/products.json");
console.log(ProductFilePath)
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
      join(productImagePath, req.params.id + path.extname(req.file.originalname)),
      req.file.buffer


    );

    let oldDb = await readDB(ProductFilePath)
    let newDb = oldDb.filter(product => product.ID !== req.params.id )
    let product = oldDb.find(product => product.ID === req.params.id )
    let modifiedProduct = { ...product };
   
    modifiedProduct.image = `http://localhost:3001/img/${req.params.id + path.extname(req.file.originalname)}`;
    newDb.push(modifiedProduct);
    await writeDB(ProductFilePath, newDb);
    res.send({ id: req.params.id });
    res.send("ok");
    //   }


    
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
