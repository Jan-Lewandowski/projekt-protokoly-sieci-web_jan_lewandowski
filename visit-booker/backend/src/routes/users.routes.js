import { Router } from "express";
import { auth } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";
import { all, get, run } from "../db/index.js";

const usersRouter = Router();

usersRouter.get("/", auth, adminOnly, async (req, res) => {
  const result = await all("SELECT id, name, email, role FROM users ORDER BY id");
  res.json(result);
});

usersRouter.get("/:id", auth, adminOnly, async (req, res) => {
  const user = await get(
    "SELECT id, name, email, role FROM users WHERE id = ?",
    [Number(req.params.id)],
  );
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
});

usersRouter.delete("/:id", auth, adminOnly, async (req, res) => {
  const user = await get(
    "SELECT id, name, email, role FROM users WHERE id = ?",
    [Number(req.params.id)],
  );
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  await run("DELETE FROM users WHERE id = ?", [Number(req.params.id)]);
  res.json(user);
});

usersRouter.put("/:id", auth, adminOnly, async (req, res) => {
  const { role } = req.body;
  const existing = await get(
    "SELECT id, name, email, role FROM users WHERE id = ?",
    [Number(req.params.id)],
  );
  if (!existing) {
    return res.status(404).json({ message: "User not found" });
  }
  if (role) {
    await run("UPDATE users SET role = ? WHERE id = ?", [role, Number(req.params.id)]);
  }
  const updated = await get(
    "SELECT id, name, email, role FROM users WHERE id = ?",
    [Number(req.params.id)],
  );
  res.json(updated);
});

export default usersRouter;
