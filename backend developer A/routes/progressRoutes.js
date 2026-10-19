const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Progress = require('../models/Progress');
const { protect } = require('../middleware/authMiddleware');
const { validateProgress } = require('../middleware/validationMiddleware');
const { queryFilter } = require('../middleware/queryMiddleware');
const { checkOwnership } = require('../middleware/ownershipMiddleware');

// @route   POST /api/progress
// @desc    Log new workout/weight progress entry
// @access  Private (Member & Trainer)
router.post('/', protect, validateProgress, async (req, res) => {
  try {
    const { weight, workoutType, durationMinutes, caloriesBurned, notes, date } = req.body;

    const progress = await Progress.create({
      user: req.user._id,
      date: date ? new Date(date) : new Date(),
      weight: Number(weight),
      workoutType: workoutType.trim(),
      durationMinutes: Number(durationMinutes),
      caloriesBurned: caloriesBurned ? Number(caloriesBurned) : 0,
      notes: notes || ''
    });

    return res.status(201).json({
      success: true,
      message: 'Progress logged successfully',
      data: progress
    });
  } catch (error) {
    console.error('Progress creation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to log progress',
      error: error.message
    });
  }
});

// @route   GET /api/progress/history
// @desc    Get user progress logs with optional date range & pagination
// @access  Private
router.get('/history', protect, queryFilter, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { user: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const totalLogs = await Progress.countDocuments(query);
    const logs = await Progress.find(query)
      .sort({ date: -1 })
      .skip(req.pagination.skip)
      .limit(req.pagination.limit);

    return res.json({
      success: true,
      count: logs.length,
      total: totalLogs,
      page: req.pagination.page,
      pages: Math.ceil(totalLogs / req.pagination.limit) || 1,
      data: logs
    });
  } catch (error) {
    console.error('Fetch progress history error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/progress/stats
// @desc    Get aggregated metrics (Total workouts, Total calories, Avg weight)
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id.toString());
    const stats = await Progress.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$user',
          totalWorkouts: { $sum: 1 },
          totalCaloriesBurned: { $sum: '$caloriesBurned' },
          totalDurationMinutes: { $sum: '$durationMinutes' },
          averageWeight: { $avg: '$weight' },
          latestWeight: { $last: '$weight' }
        }
      }
    ]);

    const result = stats[0] || {
      totalWorkouts: 0,
      totalCaloriesBurned: 0,
      totalDurationMinutes: 0,
      averageWeight: 0,
      latestWeight: 0
    };

    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('Fetch progress stats error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/progress/:id
// @desc    Update an existing progress log entry
// @access  Private (Owner only)
router.put('/:id', protect, checkOwnership(Progress), validateProgress, async (req, res) => {
  try {
    const { weight, workoutType, durationMinutes, caloriesBurned, notes, date } = req.body;

    req.resource.weight = Number(weight);
    req.resource.workoutType = workoutType.trim();
    req.resource.durationMinutes = Number(durationMinutes);
    req.resource.caloriesBurned = caloriesBurned ? Number(caloriesBurned) : 0;
    req.resource.notes = notes || '';
    if (date) req.resource.date = new Date(date);

    const updatedProgress = await req.resource.save();

    return res.json({
      success: true,
      message: 'Progress entry updated successfully',
      data: updatedProgress
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/progress/:id
// @desc    Delete a progress log entry
// @access  Private (Owner only)
router.delete('/:id', protect, checkOwnership(Progress), async (req, res) => {
  try {
    await req.resource.deleteOne();

    return res.json({
      success: true,
      message: 'Progress entry deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
