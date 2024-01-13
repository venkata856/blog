const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blog = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
    default: "",
  },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comments" }],
  added: {
    type: Date,
    default: Date.now,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Blog", blog);
