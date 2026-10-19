// Task 2.4.2: Ensure the authenticated user owns the resource being modified/deleted
const checkOwnership = (Model) => {
  return async (req, res, next) => {
    try {
      const resource = await Model.findById(req.params.id);

      if (!resource) {
        return res.status(404).json({ message: 'Resource not found' });
      }

      // Check if user is owner or an Admin
      const isOwner = resource.user && resource.user.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'Admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          message: 'Access denied: You can only modify or delete your own entries'
        });
      }

      // Attach resource to req for reuse in route handler
      req.resource = resource;
      next();
    } catch (error) {
      return res.status(500).json({ message: 'Ownership check failed', error: error.message });
    }
  };
};

module.exports = { checkOwnership };