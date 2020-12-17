const express = require("express");
const uploadRoutes = require("../files/index");
const { readDB, writeDB } = require("../../lib/utilities");
const path = require("path");
const uniqid = require("uniqid");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const axios = require("axios");
const { pipeline } = require("stream");
const { promisify } = require("util");
const { begin } = require("xmlbuilder");
const { parseString } = require("xml2js");
const { Transform } = require("json2csv");
const { join } = require("path");
const { createReadStream, createWriteStream } = require("fs-extra");
const fs = require("fs");
const asyncParser = promisify(parseString);
const pdfMake = require("pdfmake");
const fonts = {
  Roboto: {
    normal: "fonts/Roboto-Regular.ttf",
    bold: "fonts/Roboto-Medium.ttf",
    italics: "fonts/Roboto-Italic.ttf",
    bolditalics: "fonts/Roboto-MediumItalic.ttf",
  },
};
router.use("/", uploadRoutes);
const productFilePath = path.join(__dirname, "products.json"); //GETTING FILEPATH TO JSON

router.get("/", async (req, res, next) => {
  try {
    const productDataBase = await readDB(productFilePath); //RUNS FUNCTION TO GET DATABASE
    if (productDataBase.length > 0) {
      if (req.query && req.query.category) {
        const filteredproducts = productDataBase.filter((product) => product.hasOwnProperty("category") && product.category.toLowerCase() === req.query.category.toLowerCase());
        res.send(filteredproducts);
      } else {
        res.status(201).send(productDataBase); //SENDS RESPONSE WITH GOOD CODE AND WHOLE DATABSE
      }
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
    const singleProduct = productDataBase.find((product) => product.ID === req.params.id);
    if (singleProduct) {
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
    check("name").exists().isLength({ min: 1 }).withMessage("Give it a name"),
    check("description").exists().isLength({ min: 1 }).withMessage("Give it a description"),
    check("brand").exists().isLength({ min: 1 }).withMessage("You have to give a brand for the product"),
    check("price").exists().isLength({ min: 1 }).withMessage("You need to set your price"),
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

router.put(
  "/:id",
  [
    check("name").exists().isLength({ min: 1 }).withMessage("Give it a name"),
    check("description").exists().isLength({ min: 1 }).withMessage("Give it a description"),
    check("brand").exists().isLength({ min: 1 }).withMessage("You have to give a brand for the product"),
    check("price").exists().isLength({ min: 1 }).withMessage("You need to set your price"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const err = new Error();
        err.message = errors.errors.length > 0 || "Student ID not Correct";
        err.httpStatusCode = 400;
        next(err);
      } else {
        const productsDB = await readDB(productFilePath);
        const newDb = productsDB.filter((product) => product.ID !== req.params.id);

        const modifiedproduct = {
          ...req.body,
          ID: req.params.id,
          modifiedDate: new Date(),
        };

        newDb.push(modifiedproduct);
        await writeDB(productFilePath, newDb);

        res.send({ id: modifiedproduct.ID });
      }
    } catch (error) {
      next(error);
    }
  }
);

router.delete("/:id", async (req, res, next) => {
  try {
    const productDataBase = await readDB(productFilePath); //RUNS FUNCTION TO GET DATABASE
    const singleProduct = productDataBase.find((product) => product.ID === req.params.id);
    if (singleProduct) {
      const filteredDB = productDataBase.filter((product) => product.ID !== req.params.id);
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

/************************   M5-D9 exercise***************************************** */
// sum the price of two products given there id
router.get("/cart/sumTwoPrices/", async (req, res, next) => {
  try {
    const productDataBase = await readDB(productFilePath); //RUNS FUNCTION TO GET DATABASE
    if (req.query) {
      const filteredproducts = productDataBase.filter((product) => product.ID === req.query.id1 || product.ID === req.query.id2);

      const xmlBody = begin()
        .ele("soap:Envelope", {
          "xmlns:soap": "http://schemas.xmlsoap.org/soap/envelope/",
        })
        .ele("soap:Body")
        .ele("Add", {
          xmlns: "http://tempuri.org/",
        })
        .ele("intA")
        .text(filteredproducts[0].price)
        .up()
        .ele("intB")
        .text(filteredproducts[1].price)
        .end();
      console.log(xmlBody);
      const response = await axios({
        method: "post",
        url: "http://www.dneonline.com/calculator.asmx?op=Add",
        data: xmlBody,
        headers: { "Content-type": "text/xml" },
      });
      const xml = response.data;
      const data = await asyncParser(xml);
      res.send({ Sum: parseInt(data["soap:Envelope"]["soap:Body"][0].AddResponse[0].AddResult[0]) });
    } else {
      const err = {};
      err.message = "Please provide product Id as query ?id1=productID&?id2=productID";
      err.httpStatusCode = 400;
      next(err);
    }
  } catch (error) {
    next(error);
  }
});

//export All products as CSV

router.get("/export/csv", async (req, res, next) => {
  try {
    const path = join(__dirname, "products.json");
    const jsonReadableStream = createReadStream(path);

    const json2csv = new Transform({
      fields: ["ID", "name", "description", "brand", "category", "CreationDate", "modifiedDate", "image", "price"],
    });
    res.setHeader("Content-Disposition", "attachment; filename=Products.csv");
    pipeline(jsonReadableStream, json2csv, res, (err) => {
      if (err) {
        console.log(err);
        next(err);
      } else {
        console.log("Done");
      }
    });
  } catch (error) {
    next(error);
  }
});

/// Exprot a single product as PDF

router.get("/:id/exportToPDF", async (req, res, next) => {
  try {
    const productDataBase = await readDB(productFilePath); //RUNS FUNCTION TO GET DATABASE
    const singleProduct = productDataBase.find((product) => product.ID === req.params.id);
    if (singleProduct) {
      const docDefinition = {
        pageSize: "A4",
        pageMargins: [40, 60, 40, 60],
        permissions: {
          printing: "highResolution", //'lowResolution'
          modifying: false,
          copying: false,
          annotating: false,
          fillingForms: false,
          contentAccessibility: false,
        },
        header: { text: "Strive Market Place", fontSize: 22, bold: true },

        footer: {
          columns: ["Thank you for being interested in our products! ", { text: "Contact us", alignment: "right" }],
        },
        content: [
          { text: "Product Details", fontSize: 18 },
          {
            alignment: "justify",
            columns: [
              {
                width: "30%",
                text: "Name",
              },
              {
                text: singleProduct.name,
              },
            ],
          },
          {
            alignment: "justify",
            columns: [
              {
                width: "30%",
                text: "Description",
              },
              {
                text: singleProduct.description,
              },
            ],
          },
          {
            alignment: "justify",
            columns: [
              {
                width: "30%",
                text: "Brand",
              },
              {
                text: singleProduct.brand,
              },
            ],
          },
          {
            alignment: "justify",
            columns: [
              {
                width: "30%",
                text: "Category",
              },
              {
                text: singleProduct.category,
              },
            ],
          },
          {
            alignment: "justify",
            columns: [
              {
                width: "30%",
                text: "Price",
              },
              {
                text: "$" + singleProduct.price,
              },
            ],
          },
        ],
      };
      const pdfFile = new pdfMake(fonts);
      const pdfDoc = pdfFile.createPdfKitDocument(docDefinition);
      res.setHeader("Content-Type", "application/pdf");
      pdfDoc.pipe(res);
      pdfDoc.end();
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
