const express = require("express");
const cors = require("cors");
const userModel = require("./mongoDBConnect/UserSchema");
require("./mongoDBConnect/config");

const app = express();
app.use(express.json());
app.use(cors());

app.post("/register", async (req, resp) => {
    const userData = await userModel.insertMany(req.body);
    resp.send(userData);
});

app.listen(5000);