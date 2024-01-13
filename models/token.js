const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const token = new Schema({
  token: String,
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Token", token);
