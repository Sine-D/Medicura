# Medicura Backend API

This is the backend API for the Medicura appointment management system.

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory with:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medicura
NODE_ENV=development
```

3. Make sure MongoDB is running on your system

4. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/scheduled` - Get scheduled appointments
- `GET /api/appointments/completed` - Get completed appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

## Database Schema

The Appointment model includes:
- Patient information (name, age, email, phone, gender)
- Appointment details (test type, date, time, location)
- Medical information (physician, notes, insurance)
- Status and priority management
- Timestamps for creation and updates
