# Module 2 API Documentation (Progress Tracking & Workout Plans)

## Environment Variables
- `PORT`: Server port (default: 5000)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for token verification

## Core Endpoints
- `POST /api/workout-plans` - Create plan (Trainer/Admin)
- `GET /api/workout-plans/members` - Fetch client list (Trainer/Admin)
- `POST /api/progress` - Log daily progress (Member)
- `GET /api/progress/history` - Fetch log history with pagination (Member)
- `GET /api/progress/stats` - Fetch aggregate summary metrics (Member)
- `PUT /api/progress/:id` - Update log entry (Owner)
- `DELETE /api/progress/:id` - Delete log entry (Owner)