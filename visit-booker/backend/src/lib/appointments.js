import { all, get } from "../db/index.js";

export const OPEN_HOUR = 8;
export const CLOSE_HOUR = 16;
export const OPEN_MINUTES = OPEN_HOUR * 60;
export const CLOSE_MINUTES = CLOSE_HOUR * 60;

export function appointmentDateTime(date, time) {
  return new Date(`${date}T${time}`);
}

export function normalizeTime(hour, minute) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function timeToMinutes(time) {
  const parts = String(time).split(":").map(Number);
  const hour = parts[0];
  const minute = parts[1];
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return hour * 60 + minute;
}

export function minutesToTime(totalMinutes) {
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return normalizeTime(hour, minute);
}

export function normalizeDbDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

export function normalizeDbTime(value) {
  if (value === null || value === undefined) return null;
  const [hour, minute] = String(value).split(":");
  return normalizeTime(Number(hour), Number(minute || 0));
}

export function mapAppointmentRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    categoryId: row.category_id,
    serviceId: row.service_id,
    date: normalizeDbDate(row.date),
    time: normalizeDbTime(row.time),
    status: row.status,
    editRequestedCategoryId: row.edit_requested_category_id ?? null,
    editRequestedServiceId: row.edit_requested_service_id ?? null,
    editRequestedDate: row.edit_requested_date
      ? normalizeDbDate(row.edit_requested_date)
      : null,
    editRequestedTime: row.edit_requested_time
      ? normalizeDbTime(row.edit_requested_time)
      : null,
    editRequestStatus: row.edit_request_status ?? null,
  };
}

export async function getServiceByIds(categoryId, serviceId) {
  const row = await get(
    `SELECT c.id AS category_id, c.name AS category_name,
            s.id AS service_id, s.name AS service_name,
            s.duration_minutes, s.price
     FROM categories c
     JOIN services s ON s.category_id = c.id
     WHERE c.id = ? AND s.id = ?`,
    [Number(categoryId), Number(serviceId)],
  );
  if (!row) return null;
  return {
    category: { id: row.category_id, name: row.category_name },
    service: {
      id: row.service_id,
      name: row.service_name,
      durationMinutes: Number(row.duration_minutes),
      price: Number(row.price),
    },
  };
}

export async function getServiceById(serviceId) {
  const row = await get(
    `SELECT c.id AS category_id, c.name AS category_name,
            s.id AS service_id, s.name AS service_name,
            s.duration_minutes, s.price
     FROM categories c
     JOIN services s ON s.category_id = c.id
     WHERE s.id = ?`,
    [Number(serviceId)],
  );
  if (!row) return null;
  return {
    category: { id: row.category_id, name: row.category_name },
    service: {
      id: row.service_id,
      name: row.service_name,
      durationMinutes: Number(row.duration_minutes),
      price: Number(row.price),
    },
  };
}

export function getServiceDurationMinutes(service) {
  return Number(service?.durationMinutes ?? service?.duration ?? 60);
}

export function isSlotAligned(startMinutes, durationMinutes) {
  return (startMinutes - OPEN_MINUTES) % durationMinutes === 0;
}

export function overlaps(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

export async function hasOverlap(
  date,
  startMinutes,
  durationMinutes,
  categoryId,
  serviceId,
  ignoreAppointmentId = null,
) {
  const endMinutes = startMinutes + durationMinutes;
  const params = [date, Number(categoryId), Number(serviceId)];
  let sql =
    "SELECT id, time FROM appointments WHERE date = ? AND category_id = ? AND service_id = ?";
  if (ignoreAppointmentId) {
    sql += " AND id <> ?";
    params.push(Number(ignoreAppointmentId));
  }

  const result = await all(sql, params);
  return result.some((appointment) => {
    const existingStart = timeToMinutes(normalizeDbTime(appointment.time));
    if (existingStart === null) return false;
    const existingEnd = existingStart + durationMinutes;
    return overlaps(startMinutes, endMinutes, existingStart, existingEnd);
  });
}
