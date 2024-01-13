const asyncHandler = require("express-async-handler");
var express = require("express");
const genHashFromPassword = require(".././utils/password").genHashFromPassword;
const validatePassword = require(".././utils/password").validatePassword;
const User = require("../models/user");
const jwt = require("jsonwebtoken");
require("dotenv").config();

async function generateAccessToken(user) {
  return jwt.sign(user, process.env.SECRET_KEY, { expiresIn: "20m" });
}

async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

module.exports = { generateAccessToken, authenticateToken };
