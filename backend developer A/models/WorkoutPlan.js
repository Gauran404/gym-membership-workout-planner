const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number, required: true, default: 3 },
  reps: { type: Number, required: true, default: 10 },
  restSeconds: { type: Number, default: 60 }
});

const workoutPlanSchema = new mongoose.Schema(
  {
    planName: { type: String, required: true },
    title: { type: String },
    goal: { 
      type: String, 
      default: 'General Fitness' 
    },
    level: { 
      type: String, 
      enum: ['Beginner', 'Intermediate', 'Advanced'], 
      default: 'Beginner' 
    },
    daysPerWeek: { 
      type: Number, 
      default: 4, 
      min: 1, 
      max: 7 
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    exercises: [exerciseSchema],
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Archived'],
      default: 'Active'
    }
  },
  { timestamps: true }
);

// Ensure planName and title are synced
workoutPlanSchema.pre('save', function (next) {
  if (this.planName && !this.title) {
    this.title = this.planName;
  } else if (this.title && !this.planName) {
    this.planName = this.title;
  }
  if (typeof next === 'function') next();
});

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);