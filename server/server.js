const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const Transaction = require("./models/Transaction");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

console.log("MONGO_URI =", process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend is working!",
  });
});

app.post("/api/transactions", async (req, res) => {
  try {
    const transaction = new Transaction({
  description: req.body.description,
  amount: req.body.amount,
  date: req.body.date,
  user: req.body.user,
});

    const savedTransaction = await transaction.save();

    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/transactions", async (req, res) => {
  try {
    const transactions = await Transaction.find();

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get(
  "/api/transactions/user/:userId",
  async (req, res) => {
    try {
      const transactions =
        await Transaction.find({
          user: req.params.userId,
        });

      res.json(transactions);
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  }
);

app.delete("/api/transactions/:id", async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);

    res.json({
      message: "Transaction deleted",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/transactions", async (req, res) => {
  try {
    await Transaction.deleteMany({});

    res.json({
      message: "All transactions deleted",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      "expensetrackersecret",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});