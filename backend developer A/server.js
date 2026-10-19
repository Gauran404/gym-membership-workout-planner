require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { MongoMemoryServer } = require("mongodb-memory-server");

const User = require("./models/User");
const Progress = require("./models/Progress");
const WorkoutPlan = require("./models/WorkoutPlan");

const authRoutes = require("./routes/authRoutes");
const progressRoutes = require("./routes/progressRoutes");
const workoutPlanRoutes = require("./routes/workoutPlanRoutes");

const app = express();
app.use(express.json());
app.use(cors());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/workout-plans", workoutPlanRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
});

let mongoServer = null;

const startServer = async () => {
  try {
    let uri = process.env.MONGO_URI;

    // Default to in-memory MongoDB for reliable standalone local execution
    try {
      mongoServer = await MongoMemoryServer.create({ instance: { dbName: "fitnessapp" } });
      uri = mongoServer.getUri();
      console.log("Started In-Memory MongoDB Server");
    } catch (memErr) {
      console.warn("Could not start In-Memory MongoDB, falling back to MONGO_URI:", memErr.message);
    }

    await mongoose.connect(uri);
    console.log("Connected to MongoDB successfully at:", uri.split("@").pop());

    // Clean DB and seed fresh default accounts
    await User.deleteMany({});
    await Progress.deleteMany({});
    await WorkoutPlan.deleteMany({});

    // Create Trainer (Plain text password gets hashed by User pre-save hook)
    const trainer = await User.create({
      name: "Alex Trainer",
      username: "trainer@gym.com",
      email: "trainer@gym.com",
      password: "password123",
      role: "Trainer"
    });

    await User.create({
      name: "Alex Trainer",
      username: "trainer@example.com",
      email: "trainer@example.com",
      password: "password123",
      role: "Trainer"
    });

    // Create Member
    const member = await User.create({
      name: "Sam Member",
      username: "member@gym.com",
      email: "member@gym.com",
      password: "password123",
      role: "Member"
    });

    await User.create({
      name: "Sam Member",
      username: "member@example.com",
      email: "member@example.com",
      password: "password123",
      role: "Member"
    });

    // Create Member from Blackbox Test Cases (TC_LOG_001)
    const gymfitMember = await User.create({
      name: "Gaurang Sonone",
      username: "member@gymfit.com",
      email: "member@gymfit.com",
      password: "Gym@1234",
      role: "Member",
      membershipStatus: "Active"
    });

    // Create Expired Member from Blackbox Test Cases (TC_LOG_005)
    const expiredMember = await User.create({
      name: "Expired Member",
      username: "expired@gymfit.com",
      email: "expired@gymfit.com",
      password: "Gym@1234",
      role: "Member",
      membershipStatus: "Expired"
    });

    console.log("✅ Seeded Blackbox Test Accounts:");
    console.log("   - Valid Member:   member@gymfit.com  / Gym@1234 (Active)");
    console.log("   - Expired Member: expired@gymfit.com / Gym@1234 (Expired)");
    console.log("   - Trainer:        trainer@gym.com    / password123");

    // Seed sample progress entries for member
    await Progress.create([
      {
        user: gymfitMember._id,
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        weight: 75.0,
        workoutType: "Upper Body & Core",
        durationMinutes: 45,
        caloriesBurned: 320,
        notes: "Great energy throughout session"
      },
      {
        user: gymfitMember._id,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        weight: 74.2,
        workoutType: "HIIT Cardio",
        durationMinutes: 40,
        caloriesBurned: 410,
        notes: "High heart rate sprint intervals"
      },
      {
        user: gymfitMember._id,
        date: new Date(),
        weight: 72.5,
        workoutType: "Leg Day",
        durationMinutes: 50,
        caloriesBurned: 450,
        notes: "Squats and lunges felt strong"
      }
    ]);

    // Seed Workout Plan: "Beginner Strength" for TC_WP_004 & TC_WP_005
    await WorkoutPlan.create({
      planName: "Beginner Strength",
      title: "Beginner Strength",
      goal: "Muscle Gain",
      level: "Beginner",
      daysPerWeek: 4,
      user: gymfitMember._id,
      assignedTo: gymfitMember._id,
      trainer: trainer._id,
      exercises: [
        { name: "Bench Press", sets: 3, reps: 12, restSeconds: 60 }
      ],
      status: "Active"
    });
    console.log("✅ Seeded test plan 'Beginner Strength' for Gaurang Sonone");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Fitness Backend Server running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("Server Start Error:", err);
  }
};

startServer();

module.exports = app;