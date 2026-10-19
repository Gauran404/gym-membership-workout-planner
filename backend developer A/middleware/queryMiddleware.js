// Task 2.3.2: Pagination and query filtering middleware
const queryFilter = (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  req.pagination = {
    page,
    limit,
    skip
  };
  next();
};

module.exports = { queryFilter };