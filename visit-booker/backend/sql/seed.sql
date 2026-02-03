INSERT OR IGNORE INTO users (id, name, email, password, role) VALUES
  (1, 'Admin', 'admin@test.pl', '$2b$10$InYMYkOIiDAV2t6/PMbIbOZmkWFDwqCih4Ojv/rIuAJDaLnOMtA8.', 'admin'),
  (2, 'Jan Kowalski', 'janekilewandowski1@gmail.com', '$2b$10$4lMbFNLmEJT9b6gVI/ppquvUtFFjQJhlx0KOz5yM/r03ZWFhSJjAa', 'user'),
  (3, 'Anna Nowak', 'anna@example.com', '$2b$10$4lMbFNLmEJT9b6gVI/ppquvUtFFjQJhlx0KOz5yM/r03ZWFhSJjAa', 'user');

INSERT OR IGNORE INTO categories (id, name) VALUES
  (1, 'Włosy'),
  (2, 'Paznokcie'),
  (3, 'Masaż'),
  (4, 'Kosmetyka'),
  (5, 'Brwi i rzęsy'),
  (6, 'Depilacja'),
  (7, 'Makijaż');

INSERT OR IGNORE INTO services (id, category_id, name, duration_minutes, price) VALUES
  (1, 1, 'Strzyżenie męskie', 30, 50),
  (2, 1, 'Strzyżenie damskie', 60, 120),
  (3, 2, 'Manicure klasyczny', 45, 80),
  (4, 2, 'Manicure żelowy', 60, 110),
  (5, 3, 'Masaż klasyczny', 60, 150),
  (6, 4, 'Zabieg na twarz', 50, 130),
  (7, 5, 'Laminacja brwi', 40, 90),
  (8, 6, 'Depilacja woskiem', 30, 70),
  (9, 7, 'Makijaż dzienny', 45, 120);

INSERT OR IGNORE INTO appointments (id, user_id, category_id, service_id, date, time, status) VALUES
  (1, 2, 1, 1, '2026-02-04', '09:00', 'scheduled'),
  (2, 2, 1, 1, '2026-02-04', '10:00', 'scheduled'),
  (3, 2, 1, 1, '2026-02-04', '11:00', 'scheduled'),
  (4, 2, 1, 1, '2026-02-04', '12:00', 'scheduled'),
  (5, 3, 2, 4, '2026-02-04', '14:00', 'scheduled'),
  (6, 2, 3, 5, '2026-02-04', '08:00', 'scheduled'),
  (7, 3, 4, 6, '2026-02-04', '11:20', 'scheduled'),
  (8, 2, 5, 7, '2026-02-04', '10:00', 'scheduled'),
  (9, 1, 6, 8, '2026-02-04', '12:30', 'scheduled'),
  (10, 1, 7, 9, '2026-02-04', '13:15', 'scheduled');
