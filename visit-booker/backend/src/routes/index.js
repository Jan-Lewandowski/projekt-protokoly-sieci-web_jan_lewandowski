import { Router } from "express";
import usersRouter from "./users.routes.js";
import categoriesRouter from "./categories.routes.js";
import appointmentsRouter from "./appointments.routes.js";
import authRouter from "./auth.routes.js"

const router = Router();

router.use("/auth", authRouter)
router.use("/users", usersRouter);
router.use("/categories", categoriesRouter);
router.use("/appointments", appointmentsRouter);

export default router;
