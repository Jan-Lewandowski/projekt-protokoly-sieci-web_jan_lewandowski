import { Router } from "express";

const router = Router();

const users = [];
let nextId = 1;

router.get("/", (req, res) => {
  res.json(users);
});

router.get("/:id", (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (!user) {
    return json({ message: "User not found" });
  }
  res.json(user);
});

router.post("/", (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return json({ message: "Name and email required" });
  }

  const newUser = { id: nextId++, name, email };
  users.push(newUser);

  res.json(newUser);
});

router.put("/:id", (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (!user) {
    return json({ message: "User not found" });
  }

  const { name, email } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;

  res.json(user);
});

router.delete("/:id", (req, res) => {
  const index = users.findIndex((u) => u.id === parseInt(req.params.id));
  if (index === -1) {
    return json({ message: "User not found" });
  }
  const deleted = users.splice(index, 1);
  res.json(deleted[0]);
});

export default router;
