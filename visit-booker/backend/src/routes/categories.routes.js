import { Router } from "express";
import { auth } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";
import { all, get, run } from "../db/index.js";

const categoriesRouter = Router();

categoriesRouter.get("/", auth, async (req, res) => {
  const result = await all(
    `SELECT c.id AS category_id, c.name AS category_name,
            s.id AS service_id, s.name AS service_name,
            s.duration_minutes, s.price
     FROM categories c
     LEFT JOIN services s ON s.category_id = c.id
     ORDER BY c.id, s.id`,
  );

  const byCategory = new Map();
  for (const row of result) {
    if (!byCategory.has(row.category_id)) {
      byCategory.set(row.category_id, {
        id: row.category_id,
        name: row.category_name,
        services: [],
      });
    }
    if (row.service_id) {
      byCategory.get(row.category_id).services.push({
        id: row.service_id,
        name: row.service_name,
        durationMinutes: Number(row.duration_minutes),
        price: Number(row.price),
      });
    }
  }

  res.json([...byCategory.values()]);
});

categoriesRouter.get("/:categoryId/services", auth, async (req, res) => {
  const categoryId = Number(req.params.categoryId);
  const category = await get(
    "SELECT id, name FROM categories WHERE id = ?",
    [categoryId],
  );
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  const services = await all(
    "SELECT id, name, duration_minutes, price FROM services WHERE category_id = ? ORDER BY id",
    [categoryId],
  );
  res.json(
    services.map((s) => ({
      id: s.id,
      name: s.name,
      durationMinutes: Number(s.duration_minutes),
      price: Number(s.price),
    })),
  );
});

categoriesRouter.get("/:categoryId/services/search", auth, async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ message: "query parameter 'q' is required" });
  }

  const categoryId = Number(req.params.categoryId);
  const category = await get(
    "SELECT id FROM categories WHERE id = ?",
    [categoryId],
  );
  if (!category) {
    return res.status(404).json({ message: "category not found" });
  }

  const services = await all(
    "SELECT id, name, duration_minutes, price FROM services WHERE category_id = ? AND name LIKE ? ORDER BY id",
    [categoryId, `%${q}%`],
  );
  res.json(
    services.map((s) => ({
      id: s.id,
      name: s.name,
      durationMinutes: Number(s.duration_minutes),
      price: Number(s.price),
    })),
  );
});

categoriesRouter.post("/", auth, adminOnly, async (req, res) => {
  const { name } = req.body;
  if (!name)
    return res.status(400).json({ message: "Category name is required" });

  const result = await run(
    "INSERT INTO categories (name) VALUES (?)",
    [name],
  );
  const newCategory = await get(
    "SELECT id, name FROM categories WHERE id = ?",
    [result.lastID],
  );
  res.status(201).json({ ...newCategory, services: [] });
});

categoriesRouter.post("/:categoryId/services", auth, adminOnly, async (req, res) => {
  const { categoryId } = req.params;
  const { name, duration, price } = req.body;

  if (!name || !duration || !price) {
    return res
      .status(400)
      .json({ message: "name, duration and price are required" });
  }
  const category = await get(
    "SELECT id FROM categories WHERE id = ?",
    [Number(categoryId)],
  );
  if (!category) {
    return res.status(404).json({ message: "category not found" });
  }

  const result = await run(
    "INSERT INTO services (category_id, name, duration_minutes, price) VALUES (?, ?, ?, ?)",
    [Number(categoryId), name, Number(duration), Number(price)],
  );
  const service = await get(
    "SELECT id, name, duration_minutes, price FROM services WHERE id = ?",
    [result.lastID],
  );
  res.status(201).json({
    id: service.id,
    name: service.name,
    durationMinutes: Number(service.duration_minutes),
    price: Number(service.price),
  });
});

categoriesRouter.put("/:categoryId/services/:serviceId", auth, adminOnly, async (req, res) => {
  const { categoryId, serviceId } = req.params;
  const { name, duration, price } = req.body;

  const existing = await get(
    "SELECT id FROM services WHERE id = ? AND category_id = ?",
    [Number(serviceId), Number(categoryId)],
  );
  if (!existing) {
    return res.status(404).json({ message: "service not found" });
  }

  await run(
    "UPDATE services SET name = COALESCE(?, name), duration_minutes = COALESCE(?, duration_minutes), price = COALESCE(?, price) WHERE id = ? AND category_id = ?",
    [name ?? null, duration ?? null, price ?? null, Number(serviceId), Number(categoryId)],
  );

  const service = await get(
    "SELECT id, name, duration_minutes, price FROM services WHERE id = ?",
    [Number(serviceId)],
  );

  res.json({
    id: service.id,
    name: service.name,
    durationMinutes: Number(service.duration_minutes),
    price: Number(service.price),
  });
});

categoriesRouter.delete(
  "/:categoryId/services/:serviceId",
  auth,
  adminOnly,
  async (req, res) => {
    const { categoryId, serviceId } = req.params;
    const appointmentCount = await get(
      "SELECT COUNT(*) AS count FROM appointments WHERE service_id = ?",
      [Number(serviceId)],
    );
    if (Number(appointmentCount?.count ?? 0) > 0) {
      return res.status(409).json({
        message: "cannot delete service with existing appointments",
      });
    }
    const existing = await get(
      "SELECT id FROM services WHERE id = ? AND category_id = ?",
      [Number(serviceId), Number(categoryId)],
    );
    if (!existing) {
      return res.status(404).json({ message: "service not found" });
    }
    await run(
      "DELETE FROM services WHERE id = ? AND category_id = ?",
      [Number(serviceId), Number(categoryId)],
    );
    res.status(204).send();
  },
);

categoriesRouter.put("/:id", auth, adminOnly, async (req, res) => {
  const categoryId = Number(req.params.id);
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "category name is required" });
  }
  const category = await get(
    "SELECT id, name FROM categories WHERE id = ?",
    [categoryId],
  );
  if (!category) {
    return res.status(404).json({ message: "category not found" });
  }
  await run("UPDATE categories SET name = ? WHERE id = ?", [name, categoryId]);
  const updated = await get(
    "SELECT id, name FROM categories WHERE id = ?",
    [categoryId],
  );
  res.json(updated);
});

categoriesRouter.delete("/:id", auth, adminOnly, async (req, res) => {
  const categoryId = Number(req.params.id);
  const count = await get(
    "SELECT COUNT(*) AS count FROM services WHERE category_id = ?",
    [categoryId],
  );
  if (Number(count.count) > 0) {
    return res.status(409).json({
      message: "cannot delete category with existing services",
    });
  }
  const existing = await get(
    "SELECT id FROM categories WHERE id = ?",
    [categoryId],
  );
  if (!existing) {
    return res.status(404).json({ message: "category not found" });
  }
  await run("DELETE FROM categories WHERE id = ?", [categoryId]);
  res.status(204).send();
});

export default categoriesRouter;
