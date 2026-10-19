require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { MongoMemoryServer } = require("mongodb-memory-server");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Member", "Trainer", "Admin"], default: "Member" }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

const seed = async () => {
  try {
    const mongoServer = await MongoMemoryServer.create({ instance: { dbName: "fitnessapp" } });
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    
    const hashedPassword = await bcrypt.hash("password123", 10);
    await User.create([
      { name: "Alex Trainer", email: "trainer@gym.com", password: hashedPassword, role: "Trainer" },
      { name: "Sam Member", email: "member@gym.com", password: hashedPassword, role: "Member" }
    ]);

    console.log("SUCCESS: In-Memory Database Seeded!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding Error:", err.message);
    process.exit(1);
  }
};

seed();