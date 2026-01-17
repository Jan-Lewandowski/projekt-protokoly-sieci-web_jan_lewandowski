import { Router } from "express";
import usersRouter from "./users.routes.js";
import categoriesRouter from "./categories.routes.js";
import appointmentsRouter from "./appointments.routes.js";

const router = Router();

router.use("/users", usersRouter);
router.use("/categories", categoriesRouter);
router.use("/appointments", appointmentsRouter);

export default router;
