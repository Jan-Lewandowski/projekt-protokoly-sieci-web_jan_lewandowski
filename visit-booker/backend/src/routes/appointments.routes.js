import { Router } from "express";
import { categories } from "../data/categories.data.js";
import { auth } from "../middleware/auth.middleware.js"
import { adminOnly } from "../middleware/admin.middleware.js";

const appointments = [];
let nextAppointmentId = 1;

const appointmentsRouter = Router();

appointmentsRouter.get("/", auth, adminOnly, (req, res) => {
  res.json(appointments);
});

appointmentsRouter.get("/my", auth, (req, res) => {
  const myAppointments = appointments.filter(
    (a) => a.userId === req.session.user.id,
  );

  res.json(myAppointments);
});

appointmentsRouter.post("/", auth, (req, res) => {
  const { categoryId, serviceId, date, time } = req.body;
  if (!categoryId || !serviceId || !date || !time) {
    return res.status(400).json({
      message: "categoryId, serviceId, date and time are required",
    });
  }

  const category = categories.find((c) => c.id === Number(categoryId));
  if (!category) {
    return res.status(404).json({ message: "category not found" });
  }
  const service = category.services.find((s) => s.id === Number(serviceId));
  if (!service) {
    return res.status(404).json({
      message: "service not found in this category",
    });
  }

  const isBooked = appointments.find(
    (a) => a.serviceId === service.id && a.date === date && a.time === time,
  );
  if (isBooked) {
    return res.status(409).json({
      message: "this time slot is already booked",
    });
  }

  const newAppointment = {
    id: nextAppointmentId++,
    userId: req.session.user.id,
    categoryId: category.id,
    serviceId: service.id,
    date,
    time,
  };

  appointments.push(newAppointment);
  res.status(201).json(newAppointment);
});

appointmentsRouter.put("/:id", auth, (req, res) => {
  const appointmentId = Number(req.params.id);
  const { categoryId, serviceId, date, time } = req.body;
  const appointment = appointments.find((a) => a.id === appointmentId);

  if (!appointment) {
    return res.status(404).json({ message: "appointment not found" });
  }
  if (appointment.userId !== req.session.user.id && req.session.user.role !== "admin") {
    return res.status(403).json({ message: "forbidden" });
  }
  if (categoryId && serviceId) {
    const category = categories.find((c) => c.id === Number(categoryId));
    if (!category) {
      return res.status(404).json({ message: "category not found" });
    }

    const service = category.services.find((s) => s.id === Number(serviceId));
    if (!service) {
      return res.status(404).json({
        message: "service not found in this category",
      });
    }

    appointment.categoryId = category.id;
    appointment.serviceId = service.id;
  }

  if (date) appointment.date = date;
  if (time) appointment.time = time;

  res.json(appointment);
});


appointmentsRouter.delete("/:id", auth, (req, res) => {
  const appointmentIndex = appointments.findIndex(
    (a) => a.id === Number(req.params.id),
  );

  if (appointmentIndex === -1) {
    return res.status(404).json({ message: "not found" });
  }

  const appointment = appointments[appointmentIndex];

  if (
    appointment.userId !== req.session.user.id &&
    req.session.user.role !== "admin"
  ) {
    return res.status(403).json({ message: "forbidden" });
  }

  appointments.splice(appointmentIndex, 1);
  res.status(204).send();
});

export default appointmentsRouter;
