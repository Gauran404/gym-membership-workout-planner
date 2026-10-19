// Task 2.2.2: Validate incoming progress logging payload
const validateProgress = (req, res, next) => {
  const { weight, workoutType, durationMinutes } = req.body;
  const errors = [];

  if (weight === undefined || weight === null || isNaN(weight) || weight <= 0) {
    errors.push('Weight must be a positive number');
  }

  if (!workoutType || typeof workoutType !== 'string' || workoutType.trim() === '') {
    errors.push('Workout type is required');
  }

  if (
    durationMinutes === undefined ||
    durationMinutes === null ||
    isNaN(durationMinutes) ||
    durationMinutes <= 0
  ) {
    errors.push('Duration must be a positive number of minutes');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }
  next();
};

module.exports = { validateProgress };