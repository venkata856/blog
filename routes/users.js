var express = require("express");
var router = express.Router();
const asyncHandler = require("express-async-handler");
const genHashFromPassword = require(".././utils/password").genHashFromPassword;
const validatePassword = require(".././utils/password").validatePassword;
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Token = require("../models/token");
require("dotenv").config();
const {
  generateAccessToken,
  authenticateToken,
} = require("../authorization/auth");

router.post(
  "/register",
  asyncHandler(async (req, res, next) => {
    try {
      const passwordSaltHash = await genHashFromPassword(req.body.password);
      const user = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        username: req.body.username,
        salt: passwordSaltHash.salt,
        hash: passwordSaltHash.hash,
      });

      const existingUser = await User.findOne({ username: req.body.username });

      if (!existingUser) {
        await user.save();
        res.send("user created success fully");
      } else {
        res.status(400).json({ error: "user alreday exists" });
      }
    } catch (error) {
      res
        .statusCode("404")
        .json({ error: "something went wrong please try after sometime" });
    }
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res, next) => {
    if (!(req.body.userName || req.body.password)) {
      res.status(400).json({ error: "username or password missing" });
    }
    try {
      const user = await User.findOne({ username: req.body.username });

      if (!user) {
        res.status(401).json({ error: "user do not exits" });
      }
      const validPassword = await validatePassword(
        req.body.password,
        user.salt,
        user.hash
      );
      if (!validPassword) {
        res.status(401).json({ error: "user do not exists" });
      }

      const existingUser = {
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        isAdmin: user.isAdmin,
      };
      const accessToken = await generateAccessToken(existingUser);
      const refreshToken = await jwt.sign(existingUser, process.env.SECRET_KEY);

      const token = await new Token({
        token: refreshToken,
      });

      await token.save();

      res.json({
        accessToken: accessToken,
        refreshToken: refreshToken,
        admin: user.isAdmin,
      });
    } catch (error) {
      res
        .status("404")
        .json({ error: "something went wrong please try after sometime" });
    }
  })
);

router.post(
  "/token",
  asyncHandler(async (req, res, next) => {
    try {
      const refreshToken = req.body.token;
      if (refreshToken == null) res.send(401);
      const token = await Token.findOne({ token: refreshToken }).exec();

      if (!token) res.sendStatus(403);

      await jwt.verify(
        refreshToken,
        process.env.SECRET_KEY,
        async (err, user) => {
          if (err) return res.sendStatus(403);
          const accessToken = await generateAccessToken({
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username,
            isAdmin: user.isAdmin,
          });
          res.json({ accessToken: accessToken });
        }
      );
    } catch (error) {
      res
        .status("404")
        .json({ error: "something went wrong please try after sometime" });
    }
  })
);

router.post(
  "/logout",
  asyncHandler(async (req, res, next) => {
    try {
      await Token.findOneAndDelete({ token: req.body.token }).exec();

      res.status(204);
    } catch (error) {
      res
        .status("404")
        .json({ error: "something went wrong please try after sometime" });
    }
  })
);

module.exports = router;
