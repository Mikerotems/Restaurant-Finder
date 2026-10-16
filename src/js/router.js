const express = require("express");
const authenticate = require("./auth.middleware");
const { createUser, loginUser } = require("./controller");

const userRouter = express.Router();
userRouter.post("/register", createUser);
userRouter.post("/login", loginUser);
userRouter.get("/auth", authenticate, (_req, res) => {
  return res.status(200).json({ message: "Authentication successful." });
});

module.exports = userRouter;
