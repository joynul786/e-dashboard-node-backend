const express = require("express");
const cors = require("cors");
const userModel = require("./mongoDBConnect/UserSchema");
const productModel = require("./mongoDBConnect/ProductSchema");
require("./mongoDBConnect/config");

const verifyToken = require("./middlewares");
const route = express.Router();

const Jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtKey = process.env.JWT_SECRET; 

const port = process.env.LISTEN_PORT;

const app = express();
app.use(express.json());
app.use(cors());
route.use(verifyToken);
app.use("/", route);



//  API of Sing up
app.post("/signup", async (req, resp) => {
  if (req.body.name && req.body.email && req.body.password) {
    const user = new userModel(req.body);
    let resultData = await user.save();
    resultData = resultData.toObject();
    delete resultData.password;

    const token = Jwt.sign(resultData, jwtKey, { expiresIn: "1h" });
    resp.send({resultData, authToken: token});
    
  } else {
    resp.send({ Result: "Name, email and password required for login!!" });
  };
});
// API of Login
app.post("/login", async (req, resp) => {
  if (req.body.email && req.body.password) {
    const userDetail = await userModel.findOne(req.body).select("-password");

    if (userDetail) {    
      Jwt.sign({ userDetail }, jwtKey, { expiresIn: "1h" }, (err, token) => {   // above sign up jwt token code is not working here.
        resp.send({userDetail, authToken: token });
      });
    } else {
      resp.send({ Result: "No user found!!" });
    };

  } else {
    resp.send({ Result: "Email and password require for login!!" });
  };
});
// API of user account delete 
route.delete("/account/:id", async (req, resp) => {
  const getResult = await userModel.deleteOne({ _id: req.params.id });
  if (getResult) {
    resp.send(getResult);
  } else {
    resp.send({ Result: "Some thing went wrong!!" });
  }
});

// API of product add
route.post("/add-product", async (req, resp) => {
  if ( req.body.name && req.body.price && req.body.brand && req.body.category && req.body.userId ) {
    const feedData = new productModel(req.body);
    const result = await feedData.save();
    resp.send(result);
  } else {
    resp.send({ Result: "Please fill the all are requirement details!!" });
  }
});
// API of show products seperately to every login/signup user only
route.get("/products-of-user/:userId", async ( req, resp) => {
  const getData = await productModel.find({ userId: req.params.userId });
  if (getData.length > 0) {
    resp.send(getData);
  } else {
    resp.send({ Result: "No products found!!" });
  }
});
// API of product delete
route.delete("/products/:id", async (req, resp) => {
  const getResult = await productModel.deleteOne({ _id: req.params.id });
  if (getResult) {
    resp.send(getResult);
  } else {
    resp.send({ Result: "Some thing went wrong!!" });
  }
});
// API of get product for update this product
route.get("/products/:id", async (req, resp) => {      
  const getData = await productModel.findOne({ _id: req.params.id });
  if (getData) {
    resp.send(getData);
  } else {
    resp.send({ Result: "No record found!!" });
  }
});
// API of update product
route.put("/products/:id", async (req, resp) => {
  const getData = await productModel.updateOne(
    { _id: req.params.id },
    { $set: req.body }
  );
  if (getData) {
    resp.send(getData);
  }
});
// API of product search
route.get("/search/:key", verifyToken, async (req, resp) => {
  const getdata = await productModel.find({
    $or: [
      { name: { $regex: req.params.key } },
      { category: { $regex: req.params.key } },
      { brand: { $regex: req.params.key } },
    ],
  });
  resp.send(getdata);
});
// API of delete products of an user on an account delete
route.delete("/products-of-user/:userId", async ( req, resp) => {
  const getData = await productModel.deleteMany({ userId: req.params.userId });
  resp.send(getData);
});


app.listen(port);
