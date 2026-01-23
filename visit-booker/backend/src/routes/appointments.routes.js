import { Router } from "express";
import { categories } from "../data/categories.data.js";
import { auth } from "../middleware/auth.middleware.js"
import { adminOnly } from "../middleware/admin.middleware.js";

const appointments = [];
let nextAppointmentId = 1;

const appointmentsRouter = Router();

function appointmentDateTime(date, time) {
  return new Date(`${date}T${time}`);
}

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

  const [hour, minute] = time.split(":").map(Number);
  if (minute !== 0) {
    return res.status(400).json({
      message: "appointments must start at full hour",
    });
  }
  const OPEN_HOUR = 8;
  const CLOSE_HOUR = 16;
  if (hour < OPEN_HOUR || hour >= CLOSE_HOUR) {
    return res.status(400).json({
      message: "appointments can be booked only between 08:00 and 16:00",
    });
  }

  const appointmentTime = new Date(`${date}T${time}`);
  if (appointmentTime < now) {
    return res.status(400).json({
      message: "cannot create appointment in the past",
    });
  }

  const diffMs = appointmentTime - now;
  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffHours < 2) {
    return res.status(400).json({
      message: "appointments must be booked at least 2 hours in advance",
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
    status: "scheduled",
  };

  appointments.push(newAppointment);
  res.status(201).json(newAppointment);
});

appointmentsRouter.put("/:id", auth, (req, res) => {
  const appointmentId = Number(req.params.id);
  const { categoryId, serviceId, date, time } = req.body;
  const appointment = appointments.find((a) => a.id === appointmentId);

  const appointmentTime = appointmentDateTime(appointment.date, appointment.time);
  if (appointmentTime < new Date()) {
    return res.status(403).json({
      message: "past appointments cannot be modified",
    })
  }

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

  const appointmentTime = appointmentDateTime(appointment.date, appointment.time);
  if (appointmentTime < new Date()) {
    return res.status(403).json({
      message: "past appointments cannot be modified",
    })
  }

  const now = new Date();
  const diffMs = appointmentTime - now;
  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffHours < 24) {
    return res.status(403).json({
      message: "appointments cannot be modified less than 24 hours before",
    });
  }

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
