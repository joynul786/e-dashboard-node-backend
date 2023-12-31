const express = require("express");
const cors = require("cors");
const userModel = require("./mongoDBConnect/UserSchema");
const productModel = require("./mongoDBConnect/ProductSchema");
require("./mongoDBConnect/config");

const bcrypt = require("bcryptjs");

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



//  API of Sing up=
app.post("/signup", async (req, resp) => {

  // Get all the data from body
  const { name, email, password } = req.body;
  // Encrypt the password
  const encPassword = await bcrypt.hash(password, 10);
  
  try {
    
    if (name && email && encPassword) {
      // check if user already exists
      const isUserExist = await userModel.findOne({ email: email });
      if(isUserExist) {
        return resp.status(400).send({ Result: "Already have user with the same email id !!!" });
      };
      // If new user then send details to data base
      const user = new userModel({ name, email, password: encPassword });
      let resultData = await user.save();
      resultData = resultData.toObject();
      delete resultData.password;
      // Token generate and send it with user details except password
      const token = Jwt.sign(resultData, jwtKey, { expiresIn: "10h" });
      resp.status(201).send({resultData, authToken: token});
    } else {
      resp.status(400).send({ Result: "Name, Email and Password required for login!!" });
    };

  } catch (error) {
    console.error(error);
    resp.status(500).send({ Result: "An error occurred while processing your request." });
  };
});
// API of Login=
app.post("/login", async (req, resp) => {

  // Get all the data from body
  const { email, password } = req.body;

  try {

    if (email && password) {
      // Find the user in data base
      let userDetail = await userModel.findOne({ email: email });
      // User matched with email and then Compare the password with DB password
      if (userDetail && (await bcrypt.compare(password, userDetail.password))) { 
        // Delete password from userDetail
        userDetail = userDetail.toObject();
        delete userDetail.password;
        // Token generate and send it with user details except password
        await Jwt.sign({ userDetail }, jwtKey, { expiresIn: "10h" }, (err, token) => {   // note:above sign up jwt token code is not working here.
          resp.status(202).send({userDetail, authToken: token });
        });
      } else {
        // Password and Email don't match
        resp.status(401).send({ Result: "No user found / Invalid password!!" });
      };
    } else {
      resp.status(400).send({ Result: "Email and Password require for login!!" });
    };

  } catch (error) {
    console.error(error);
    resp.status(500).send({ Result: "An error occurred while processing your request." });
  }
});
// API of user account delete=
route.delete("/account/:id", async (req, resp) => {
  try {

    const getResult = await userModel.deleteOne({ _id: req.params.id });
    if (getResult) {
      resp.status(202).send(getResult);
    } else {
      resp.status(400).send({ Result: "Some thing went wrong!!" });
    }
    
  } catch (error) {
    console.error(error);
    resp.status(500).send({ Result: "An error occurred while processing your request!!" });
  }
});
// API of forgot password change of singed up user
app.put("/password-change/:email", async (req, resp) => {
  try {

    // Check the user in data base
    const userEmail = await userModel.findOne({ email: req.params.email });
    if (userEmail) {
      // User present in data base
      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      await userModel.updateOne(
        { email: req.params.email },
        { $set: { password: hashedPassword } },
      );
      resp.status(201).send({ Result: `${userEmail.name} successfully update your password.` });
    } else {
      // User not present in data base
      resp.status(404).send({ Result: "No user found with this email address!!" });
    };
    
  } catch (error) {
    console.error({ Result: "An error occurred while processing your request!!" });
  };
});

// API of product add=
route.post("/add-product", async (req, resp) => {
  try {

    if ( req.body.name && req.body.price && req.body.brand && req.body.category && req.body.userId ) {
      const feedData = new productModel(req.body);
      const result = await feedData.save();
      resp.status(201).send(result);
    } else {
      resp.status(400).send({ Result: "Please fill the all are requirement details!!" });
    };

  } catch (error) {
    console.error(error);
    resp.status(500).send({ Result: "An error occurred while processing your request." });
  }
});
// API of show products seperately to every login/signup user=
route.get("/products-of-user/:userId", async (req, resp) => {
  try {

    const getData = await productModel.find({ userId: req.params.userId });
    if (getData.length > 0) {
      resp.status(200).send(getData);
    } else {
      resp.status(404).send({ Result: "No products found!!" });
    }

  } catch (error) {
    console.error(error);
    resp.status(500).send({ Result: "An error occurred while processing your request." });
  }
});
// API of product delete
route.delete("/products/:id", async (req, resp) => {
  try {

    const getResult = await productModel.deleteOne({ _id: req.params.id });
    if (getResult) {
      resp.status(202).send(getResult);
    } else {
      resp.status(400).send({ Result: "Some thing went wrong!!" });
    }

  } catch (error) {
    console.error(error);
    resp.status(500).send({ Result: "An error occurred while processing your request." });
  }
});
// API of get product for update this product
route.get("/products/:id", async (req, resp) => {  
  try {
    
    const getData = await productModel.findOne({ _id: req.params.id });
    if (getData) {
      resp.status(200).send(getData);
    } else {
      resp.status(404).send({ Result: "No record found!!" });
    }

  } catch (error) {
    console.error(error);
    resp.status(500).send({ Result: "An error occurred while processing your request." });
  }
});
// API of update product=
route.put("/products/:id", async (req, resp) => {
  try {

    const getData = await productModel.updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );
    if (getData) {
      resp.status(202).send(getData);
    }

  } catch (error) {
    console.error(error);
    resp.status(500).send({ Result: "An error occurred while processing your request." });
  }
});
// API of product search=
route.get("/search/:key", async (req, resp) => {
  try {
    
    const getdata = await productModel.find({
      $or: [
        { name: { $regex: req.params.key } },
        { category: { $regex: req.params.key } },
        { brand: { $regex: req.params.key } },
      ],
    });
    resp.status(200).send(getdata);

  } catch (error) {
    console.error(error);
    resp.status(500).send({ Result: "An error occurred while processing your request." });
  }
});
// API of delete products of an user on an account delete=
route.delete("/products-of-user/:userId", async (req, resp) => {
  try {
    
    const getData = await productModel.deleteMany({ userId: req.params.userId });
    resp.status(200).send(getData);

  } catch (error) {
    console.error(error);
    resp.status(500).send({ Result: "An error occurred while processing your request." });
  }
});

app.use("/", route);


app.listen(port);
