var express = require("express");
var router = express.Router();
const asyncHandler = require("express-async-handler");

const User = require("../models/user");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const { authenticateToken } = require("../authorization/auth");

router.post(
  "/add",
  authenticateToken,
  asyncHandler(async (req, res, next) => {
    try {
      const existingUser = await User.findOne({
        username: req.user.username,
      }).exec();

      const comment = await new Comment({
        content: req.body.content,
        owner: existingUser,
        blog: req.body.blog,
      });

      const newComment = await comment.save({ new: true });

      const results = await Blog.findByIdAndUpdate(
        req.body.blog,
        {
          $push: { comments: {_id:comment.id} },
        },
        { new: true }
      ).exec();

      res.status(200).json({ id: newComment.id });
    } catch (err) {
      res.status(404).json({ error: "something went wrong" });
    }
  })
);

router.post(
  "/delete/:id",
  authenticateToken,
  asyncHandler(async (req, res, next) => {
    try {
      const comment = await Comment.findById(req.params.id)
        .populate("owner")
        .populate("blog")
        .exec();

      if (!comment) {
        res.status(404).json({ error: "no comment with the requested id" });
      }

      const blog = await Blog.findById(comment.blog.id)
        .populate("owner")
        .exec();

      if (
        comment.owner.username === req.user.username ||
        req.user.isAdmin ||
        blog.owner.username === req.user.username
      ) {
        await Comment.findByIdAndDelete(req.params.id);
        await Blog.findByIdAndUpdate(
          blog.id,
          {
            $pull: { comments: { $in: [comment.id] } },
          },
          { new: true }
        ).exec();
        res.status(200).json("comment is deleted");
      } else {
        res
          .status(401)
          .json("only admin or blog owner or comment owner can delete comment");
      }
    } catch (err) {
      console.log(err);
      res.status(404).json({ error: "something went wrong" });
    }
  })
);

module.exports = router;
