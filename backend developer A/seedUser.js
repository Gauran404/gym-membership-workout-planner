const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');

const seed = async () => {
  try {
    await connectDB();

    // Plain text passed here; userSchema pre('save') hook will automatically hash it
    await User.create({
      name: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      role: 'Member'
    });

    console.log('SUCCESS: Seeded test@example.com / password123');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
};

seed();