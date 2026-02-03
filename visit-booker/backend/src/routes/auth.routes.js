import express from "express";
import bcrypt from "bcrypt";
import { get, run } from "../db/index.js";

const authRouter = express.Router();

authRouter.get("/me", (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: "not authenticated" });
  }

  res.json({
    id: req.session.user.id,
    role: req.session.user.role,
    email: req.session.user.email,
  });
});

authRouter.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email and password required" });
  }

  const exists = await get("SELECT 1 FROM users WHERE email = ?", [email]);
  if (exists) {
    return res.status(409).json({ message: "user already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const role = req.body.email === "admin@test.pl" ? "admin" : "user"

  const insertResult = await run(
    "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
    [email, hashedPassword, role],
  );
  const newUser = await get(
    "SELECT id, email, role FROM users WHERE id = ?",
    [insertResult.lastID],
  );

  const newUserCheck = await get(
    "SELECT id, password FROM users WHERE email = ? AND password = ?",
    [email, hashedPassword],
  );

  console.log(newUserCheck);

  req.session.user = {
    id: newUser.id,
    role: newUser.role,
    email: newUser.email,
  };

  res.status(201).json({ message: "registered and logged in" });
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await get(
    "SELECT id, email, password, role FROM users WHERE email = ?",
    [email],
  );
  if (!user) {
    return res.status(401).json({ message: "user not found" });
  }

  const passwordValid = await bcrypt.compare(password, user.password);
  if (!passwordValid) {
    return res.status(401).json({ message: "invalid password" });
  }

  req.session.user = {
    id: user.id,
    role: user.role,
    email: user.email,
  };

  res.json({ message: "logged in" });
});


authRouter.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("visit-booker.sid");
    res.json({ message: "logged out" });
  });
});


export default authRouter;
