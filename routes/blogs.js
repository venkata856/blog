var express = require("express");
var router = express.Router();
const asyncHandler = require("express-async-handler");

const User = require("../models/user");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const { authenticateToken } = require("../authorization/auth");
const comment = require("../models/comment");

router.post(
  "/create",
  authenticateToken,
  asyncHandler(async (req, res, next) => {
    console.log(req);
    try {
      const existingUser = await User.findOne({
        username: req.user.username,
      }).exec();
      const blog = await new Blog({
        title: req.body.title,
        content: req.body.content,
        owner: existingUser,
        isPublished: req.body.isPublished,
      });

      const newBlog = await blog.save({ new: true });
      res.json({ id: newBlog.id });
    } catch (error) {
      res.status(404).json({ error: "something went wrong" });
    }
  })
);

router.get(
  "/allblogs",
  // authenticateToken,
  asyncHandler(async (req, res, next) => {
    // if (req.user.isAdmin) {
    //   const blogs = await Blog.find().exec();
    //   res.json(blogs);
    // } else {
    //   res.status(403).json({ error: "only admins can see all the blogs" });
    // }
    const blogs = await Blog.find().exec();
    res.json(blogs);
  })
);

router.get(
  "/myblogs",
  authenticateToken,
  asyncHandler(async (req, res, next) => {
    try {
      const blogs = await Blog.find().exec();
      const existingUser = await User.findOne({ username: req.user.username });

      res.json(blogs.filter((blog) => blog.owner == existingUser.id));
    } catch (error) {
      res.status(404).json({ error: "something went wrong" });
    }
  })
);

router.post(
  "/delete/:id",
  authenticateToken,
  asyncHandler(async (req, res, next) => {
    try {
      //find blog first and see if any entry for the id requested
      const blog = await Blog.findById(req.params.id).populate("owner").exec();

      //if there is no blog send status code 404
      if (!blog) {
        res.status(404).json({ error: "no blog found to delete " });
      }

      //if the blog exists then check if the requested user is admin or owner of the blog if not send status code 403
      if (req.user.isAdmin || req.user.username === blog.owner.username) {
        await Comment.deleteMany({ id: { $in: blog.comments } }).exec();
        await Blog.findByIdAndDelete(req.params.id).exec();
        res.status(200).json({
          msg: "blog and comments associated to blog deleted successfully",
        });
      } else {
        res
          .status(403)
          .json({ error: "only admin or blog owner can delete the blog" });
      }
    } catch (error) {
      //if there is any issue in altering the entry in data base send status code 404
      res.status(404).json({ error: "something went wrong" });
    }
  })
);

router.get(
  "/:id",
  // authenticateToken,
  asyncHandler(async (req, res, next) => {
    try {
      //find blog first and see if any entry for the id requested
      const blog = await Blog.findById(req.params.id)
        .populate("owner")
        .populate({ path: "comments" })
        .exec();

      //if there is no blog send status code 404
      if (!blog) {
        res.status(404).json({ error: "no blog found" });
      } else {
        res.json(blog);
      }
    } catch (error) {
      //if there is any issue in altering the entry in data base send status code 404
      res.status(404).json({ error: "something went wrong" });
    }
  })
);

module.exports = router;
