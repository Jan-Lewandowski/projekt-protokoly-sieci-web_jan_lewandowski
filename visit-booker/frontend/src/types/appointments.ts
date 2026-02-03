export type Appointment = {
  id: number;
  userId: number;
  categoryId: number;
  serviceId: number;
  date: string;
  time: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  editRequestedCategoryId?: number | null;
  editRequestedServiceId?: number | null;
  editRequestedDate?: string | null;
  editRequestedTime?: string | null;
  editRequestStatus?: "pending" | "approved" | "rejected" | null;
};

export type AppointmentEvent = {
  type: "appointments:update";
  event: "created" | "updated" | "deleted";
  payload: {
    appointment?: Appointment;
    appointmentId?: number;
  };
};
