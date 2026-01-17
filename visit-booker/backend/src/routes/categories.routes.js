import { Router } from "express";
import {
  categories,
  generateCategoryId,
  generateServiceId,
} from "../data/categories.data.js";

const categoriesRouter = Router();

categoriesRouter.get("/", (req, res) => {
  const simpleCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    services: c.services,
  }));
  res.json(simpleCategories);
});

categoriesRouter.get("/:categoryId/services", (req, res) => {
  const category = categories.find(
    (c) => c.id === Number(req.params.categoryId),
  );
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  res.json(category.services || []);
});

categoriesRouter.get("/:categoryId/services/search", (req, res) => {
  const { q } = req.query;
  const category = categories.find(
    (c) => c.id === Number(req.params.categoryId),
  );
  if (!category) {
    return res.status(404).json({ message: "category not found" });
  }

  if (!q) {
    return res.status(400).json({ message: "query parameter 'q' is required" });
  }

  const result = (category.services || []).filter((service) =>
    service.name.toLowerCase().includes(q.toLowerCase()),
  );
  res.json(result);
});

categoriesRouter.post("/", (req, res) => {
  const { name } = req.body;
  if (!name)
    return res.status(400).json({ message: "Category name is required" });

  const newCategory = { id: generateCategoryId(), name, services: [] };
  categories.push(newCategory);
  res.status(201).json(newCategory);
});

categoriesRouter.post("/:categoryId/services", (req, res) => {
  const { categoryId } = req.params;
  const { name, duration, price } = req.body;

  if (!name || !duration || !price) {
    return res
      .status(400)
      .json({ message: "name, duration and price are required" });
  }
  const category = categories.find((c) => c.id === Number(categoryId));
  if (!category) {
    return res.status(404).json({ message: "category not found" });
  }

  const newService = { id: generateServiceId(), name, duration, price };
  category.services.push(newService);

  res.status(201).json(newService);
});

categoriesRouter.put("/:id", (req, res) => {
  const categoryId = Number(req.params.id);
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "category name is required" });
  }
  const category = categories.find((c) => c.id === categoryId);
  if (!category) {
    return res.status(404).json({ message: "category not found" });
  }

  category.name = name;
  res.json(category);
});

categoriesRouter.delete("/:id", (req, res) => {
  const categoryId = Number(req.params.id);
  const index = categories.findIndex((c) => c.id === categoryId);

  if (index === -1) {
    return res.status(404).json({ message: "category not found" });
  }
  if (categories[index].services.length > 0) {
    return res.status(409).json({
      message: "cannot delete category with existing services",
    });
  }

  categories.splice(index, 1);
  res.status(204).send();
});

export default categoriesRouter;
