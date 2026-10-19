// Task 2.5.2: Security boundary check helper
const verifyRoleBoundary = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== requiredRole && req.user.role !== 'Admin') {
      return res.status(403).json({
        message: `Forbidden: Restricted to ${requiredRole} accounts only`
      });
    }

    next();
  };
};

module.exports = { verifyRoleBoundary };