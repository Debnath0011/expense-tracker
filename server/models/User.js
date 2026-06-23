const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },
});

transactions: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
  },
],

module.exports = mongoose.model("User", userSchema);