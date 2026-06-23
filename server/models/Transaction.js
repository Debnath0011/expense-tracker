const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  date: {
    type: Date,
    default: Date.now,
  },

user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

});


module.exports = mongoose.model(
  "Transaction",
  transactionSchema
);