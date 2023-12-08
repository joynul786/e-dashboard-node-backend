const express = require("express");
const cors = require("cors");
const userModel = require("./mongoDBConnect/UserSchema");
require("./mongoDBConnect/config");

const app = express();
app.use(express.json());
app.use(cors());

app.post("/register", async (req, resp) => {
    const user = new userModel(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password;
    resp.send(result);
});

app.post("/login", async (req, resp) => {
    if ((req.body.email || req.body.name) && req.body.password) {
        const searchUser = await userModel.findOne(req.body).select("-password");
        searchUser ? resp.send(searchUser) : resp.send({ Result: "No User Found!!" });
    } else {
        resp.send({ Result: "Email / Username and password require for login!!" });
    };
});

app.listen(5000);