const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true // Index user field for fast lookups
    },
    date: {
      type: Date,
      default: Date.now
    },
    weight: { type: Number, required: true },
    workoutType: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    caloriesBurned: { type: Number, default: 0 },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

// Compound Index for efficient user history sorting and range filtering
progressSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Progress', progressSchema);