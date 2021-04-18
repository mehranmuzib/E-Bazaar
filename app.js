const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require('cors');

require("dotenv/config");

const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");


app.use(cors());
app.options('*', cors())

//middleware
app.use(bodyParser.json());
app.use(morgan("tiny"));
app.use(authJwt());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'))
app.use(errorHandler);


//Routes
const categoriesRoutes = require("./routes/categories");
const productsRoutes = require("./routes/products");
const userRoutes = require("./routes/users");
const orderRoutes = require("./routes/orders");

const api = process.env.API_URL;

app.use(`${api}/products`, productsRoutes);
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/users`, userRoutes);
app.use(`${api}/orders`, orderRoutes);

// http://localhost:2000/api/v1/products

//const Product = require("./models/product");

//Database
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "E-Bazaar",
  })
  .then(() => {
    console.log("Database Connection is ready");
  })
  .catch((err) => {
    console.log(err);
  });

//Development

//app.listen(3000, () => {
//console.log(api);
// console.log("server is running http://localhost:3000");
//});


var server = app.listen(process.env.PORT || 3000, function () {
  var port = server.address().port;
  console.log("Express is working on port " + port)
})