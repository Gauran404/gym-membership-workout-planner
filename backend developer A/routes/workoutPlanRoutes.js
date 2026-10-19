const express = require('express');
const router = express.Router();
const WorkoutPlan = require('../models/WorkoutPlan');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/workout-plans/members
// @desc    Fetch client list (members)
// @access  Private
router.get('/members', protect, async (req, res) => {
  try {
    const members = await User.find({ role: 'Member' }).select('_id name email username');
    return res.json({
      success: true,
      data: members
    });
  } catch (error) {
    console.error('Fetch members error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/workout-plans
// @desc    Fetch workout plans for the authenticated user ("My Plans")
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    // Find plans created by user, assigned to user, or where user is trainer
    const plans = await WorkoutPlan.find({
      $or: [
        { user: userId },
        { assignedTo: userId },
        { trainer: userId }
      ]
    })
      .populate('trainer', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    console.error('Fetch workout plans error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/workout-plans
// @desc    Create a new workout plan (TC_WP_001, TC_WP_002, TC_WP_003)
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { planName, title, goal, level, daysPerWeek, exercises, assignedTo } = req.body;
    const resolvedName = (planName || title || '').trim();

    // TC_WP_002: Create workout plan with empty plan name
    if (!resolvedName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Plan name is required' 
      });
    }

    // TC_WP_003: Create workout plan with days per week above or below limits
    if (daysPerWeek !== undefined && daysPerWeek !== null && daysPerWeek !== '') {
      const numDays = Number(daysPerWeek);
      if (isNaN(numDays) || numDays < 1 || numDays > 7) {
        return res.status(400).json({ 
          success: false, 
          message: 'Days per week must be between 1 and 7' 
        });
      }
    }

    const newPlan = await WorkoutPlan.create({
      planName: resolvedName,
      title: resolvedName,
      goal: (goal || 'Muscle Gain').trim(),
      level: level || 'Beginner',
      daysPerWeek: daysPerWeek !== undefined ? Number(daysPerWeek) : 4,
      user: req.user._id,
      trainer: req.user.role === 'Trainer' ? req.user._id : undefined,
      assignedTo: assignedTo || req.user._id,
      exercises: Array.isArray(exercises) ? exercises : [],
      status: 'Active'
    });

    const populatedPlan = await WorkoutPlan.findById(newPlan._id)
      .populate('trainer', 'name email')
      .populate('assignedTo', 'name email');

    // TC_WP_001: Success
    return res.status(201).json({
      success: true,
      message: 'Workout plan created successfully',
      data: populatedPlan
    });
  } catch (error) {
    console.error('Create workout plan error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/workout-plans/:id/exercises
// @desc    Add exercise to an existing plan (TC_WP_004)
// @access  Private
router.post('/:id/exercises', protect, async (req, res) => {
  try {
    const { name, sets, reps, restSeconds } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Exercise name is required' });
    }

    const plan = await WorkoutPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Workout plan not found' });
    }

    plan.exercises.push({
      name: name.trim(),
      sets: sets !== undefined ? Number(sets) : 3,
      reps: reps !== undefined ? Number(reps) : 10,
      restSeconds: restSeconds !== undefined ? Number(restSeconds) : 60
    });

    await plan.save();

    return res.status(200).json({
      success: true,
      message: 'Exercise added successfully to plan',
      data: plan
    });
  } catch (error) {
    console.error('Add exercise error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/workout-plans/:id
// @desc    Delete an existing workout plan (TC_WP_005)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Workout plan not found' });
    }

    await plan.deleteOne();

    // TC_WP_005: Success message
    return res.json({ 
      success: true, 
      message: 'Plan removed successfully from My Plans' 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;