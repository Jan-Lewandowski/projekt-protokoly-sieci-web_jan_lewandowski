# VisitBooker

A full-stack appointment booking application with real-time updates, an admin panel, and email notifications.

## Technologies
- Backend: Node.js, Express, SQLite, WebSocket
- Frontend: Next.js (React)
- Communication: MQTT (notifications)
- E-mail: Nodemailer (Gmail)

## Requirements
- Node.js 18+
- MQTT broker (e.g., Mosquitto) running at `mqtt://localhost:1883`
- Gmail app password for sending emails

## Running the project

### 1) Backend
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```
GMAIL_USER=your@gmail.com
GMAIL_APP_PASSWORD=your_app_password
```
Start the backend:
```bash
npm start
```

Backend runs at: http://localhost:4000

### 2) MQTT notification service
In a separate terminal:
```bash
cd backend/src/mqtt/notificationService
node index.js
```

### 3) Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:3000

## Data and seed
The SQLite database file is stored by default at `backend/data/visit_booker.sqlite`. First, add the `data` folder inside the backend directory. If the file does not exist, the schema and seed data are created automatically.

## Features
- Registration/login with sessions
- Service browsing and appointment booking
- Real-time updates (WebSocket)
- Admin panel for categories, services, and appointments
- Appointment reschedule requests with admin approval
- Email notifications via MQTT + Nodemailer

## Notes
- Make sure the MQTT broker is running before starting the notification service.
- If emails are not delivered, check your Gmail app password and spam folder.
