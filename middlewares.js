const Jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtKey = process.env.JWT_SECRET; 

module.exports = verifyToken = (req, resp, next) => {
    let token = req.headers["authorization"];
    if (token) {
        token = token.split(" ")[1];
        Jwt.verify(token, jwtKey, (err, valid) => {
            if (err) {
                resp.status(401).send({ Result: "Please provide valid token." });
            } else {
                next();
            };
        });
    } else {
        resp.status(403).send({ Result: "Please provide token with header." });
    };
};