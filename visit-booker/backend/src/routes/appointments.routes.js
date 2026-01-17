import { users } from "../data/users.data.js";
import { services } from "../data/services.data.js";

import { Router } from "express";

const appointmentsRouter = Router();
const appointments = [];
let nextId = 1;

appointmentsRouter.get("/", (req, res) => {
  res.json(appointments);
});

appointmentsRouter.post("/", (req, res) => {
  const { userId, serviceId, date } = req.body;

  if (!userId || !serviceId || !date) {
    return res.status(400).json({
      message: "userId, serviceId and date are required"
    });
  }

  const userExists = users.some(u => u.id === userId);
  if (!userExists) {
    return res.status(404).json({ message: "User does not exist" });
  }

  const serviceExists = services.some(s => s.id === serviceId);
  if (!serviceExists) {
    return res.status(404).json({ message: "Service does not exist" });
  }

  const newAppointment = {
    appointmentId: nextId++,
    userId,
    serviceId,
    date,
    status: "booked"
  };

  appointments.push(newAppointment);
  res.status(201).json(newAppointment);
});


appointmentsRouter.delete("/:id", (req, res) => {
  const index = appointments.findIndex(
    a => a.id === parseInt(req.params.id)
  );

  if (index === -1) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  const cancelled = appointments.splice(index, 1);
  res.json(cancelled[0]);
});

export default appointmentsRouter;
