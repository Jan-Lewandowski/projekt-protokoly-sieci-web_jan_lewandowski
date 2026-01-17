import { Router } from "express";
import { categories } from "../data/categories.data.js";

const appointments = [];
let nextAppointmentId = 1;

const appointmentsRouter = Router();

appointmentsRouter.get("/", (req, res) => {
  res.json(appointments);
});

appointmentsRouter.post("/", (req, res) => {
  const { userName, categoryId, serviceId, date, time } = req.body;
  if (!userName || !categoryId || !serviceId || !date || !time) {
    return res.status(400).json({
      message: "userName, categoryId, serviceId, date and time are required",
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
    userName,
    categoryId: category.id,
    serviceId: service.id,
    date,
    time,
  };

  appointments.push(newAppointment);
  res.status(201).json(newAppointment);
});

appointmentsRouter.put("/:id", (req, res) => {
  const appointmentId = Number(req.params.id);
  const { categoryId, serviceId, date, time } = req.body;

  const appointment = appointments.find((a) => a.id === appointmentId);
  if (!appointment) {
    return res.status(404).json({ message: "appointment not found" });
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

appointmentsRouter.delete("/:id", (req, res) => {
  const appointmentId = Number(req.params.id);
  const index = appointments.findIndex((a) => a.id === appointmentId);

  if (index === -1) {
    return res.status(404).json({ message: "appointment not found" });
  }

  appointments.splice(index, 1);
  res.status(204).send();
});

export default appointmentsRouter;
