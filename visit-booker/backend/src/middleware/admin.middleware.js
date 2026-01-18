export const adminOnly = (req, res, next) => {
  if (req.session.user.role !== "admin") {
    return res.status(403).json({ message: "admin only" });
  }
  next();
};
