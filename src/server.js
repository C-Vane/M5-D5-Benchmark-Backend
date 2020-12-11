//Import external library
const express = require("express");
const listEndpoints = require("express-list-endpoints");
const { join } = require("path");
//Import cors
const cors = require("cors");
//Import routers
const productsRouter = require("./services/products");
const reviewsRouter = require("./services/reviews");
//import error handler
const { notFoundHandler, unauthorizedHandler, forbiddenHandler, badRequestHandler, catchAllHandler } = require("./errorHandling");
//use server handling library
const server = express();
//set used port
const port = process.env.PORT || 3001;
const publicFolderPath = join(__dirname, "../public");
console.log(publicFolderPath);
//call diffrent routers for diffrent endpoints
server.use(express.static(publicFolderPath));
server.use(cors());
server.use(express.json());
server.use("/products", productsRouter);
server.use("/:id/reviews", reviewsRouter);

//Call diffrent error handlers for diffrent errors
server.use(notFoundHandler);
server.use(unauthorizedHandler);
server.use(forbiddenHandler);
server.use(badRequestHandler);
server.use(catchAllHandler);
//console log endpoints for debuging
console.log(listEndpoints(server));

//litsen to sent request on the set PORT
server.listen(port, () => {
  console.log("Server running on port " + port);
});
