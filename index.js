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


app.listen(5000);