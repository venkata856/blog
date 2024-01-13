const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const comment = new Schema({
  content: {
    type: String,
    required: true,
    default: "",
  },
  added: {
    type: Date,
    default: Date.now,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  blog: {
    type: Schema.Types.ObjectId,
    ref: "Blog",
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Comments", comment);
