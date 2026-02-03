import { run } from "../db/index.js";

const STATUS_CHECK_INTERVAL_MS = 60 * 1000;

export async function markExpiredAppointments() {
  const nowSql = "datetime('now', 'localtime')";

  await run(
    `UPDATE appointments
		 SET status = 'in_progress'
		 WHERE status = 'scheduled'
			 AND datetime(date || ' ' || time) <= ${nowSql}
			 AND datetime(
						 date || ' ' || time,
						 '+' || (SELECT duration_minutes FROM services WHERE services.id = appointments.service_id) || ' minutes'
					 ) > ${nowSql}`,
  );

  await run(
    `UPDATE appointments
		 SET status = 'completed'
		 WHERE status IN ('scheduled', 'in_progress')
			 AND datetime(
						 date || ' ' || time,
						 '+' || (SELECT duration_minutes FROM services WHERE services.id = appointments.service_id) || ' minutes'
					 ) <= ${nowSql}`,
  );
}

export function startAppointmentStatusCron() {
  void markExpiredAppointments();
  return setInterval(() => void markExpiredAppointments(), STATUS_CHECK_INTERVAL_MS);
}
