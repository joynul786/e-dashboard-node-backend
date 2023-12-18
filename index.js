const express = require("express");
const cors = require("cors");
const userModel = require("./mongoDBConnect/UserSchema");
const productModel = require("./mongoDBConnect/ProductSchema");
require("./mongoDBConnect/config");

const app = express();
app.use(express.json());
app.use(cors());

app.post("/signup", async (req, resp) => {
    if (req.body.name && req.body.email && req.body.password) {
        const user = new userModel(req.body);
        let result = await user.save();
        result = result.toObject();
        delete result.password;
        resp.send(result);
    } else {
        resp.send({ Result: "Name, email and password required for login!!" });
    };
    
});
app.post("/login", async (req, resp) => {
    if (req.body.email && req.body.password) {
        const searchUser = await userModel.findOne(req.body).select("-password");
        searchUser ? resp.send(searchUser) : resp.send({ Result: "No User Found!!" });
    } else {
        resp.send({ Result: "Email and password require for login!!" });
    };
});


app.post("/add-product", async (req, resp) => {
    if (req.body.name && req.body.price && req.body.brand && req.body.category && req.body.userId) {
        const feedData = new productModel(req.body);
        const result = await feedData.save();
        resp.send(result);
    } else {
        resp.send({Result:"Please fill the all are requirement details!!"});
    };
});
app.get("/products", async (_, resp) => {
    const getData = await productModel.find();
    if (getData.length > 0) {
        resp.send(getData);
    } else {
        resp.send({ Result: "No products found!!" });
    };
});
app.delete("/products/:id", async (req, resp) => {
    const getResult = await productModel.deleteOne({_id:req.params.id});
    if (getResult) {
        resp.send(getResult);
    } else {
        resp.send({ Result: "Some thing went wrong!!" });
    };
});
app.get("/products/:id", async (req, resp) => {
    const getData = await productModel.findOne({_id:req.params.id});
    if (getData) {
        resp.send(getData);
    } else {
        resp.send({ Result: "No record found!!" });
    };
});


app.listen(5000);