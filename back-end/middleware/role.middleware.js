/**
 * @param {...string} roles - allowed User.role values
 */
function requireRoles(...roles) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) {
      return res.status(403).json({
        success: false,
        message: 'Không xác định được quyền. Vui lòng đăng nhập lại.',
      });
    }
    if (!roles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thực hiện thao tác này.',
      });
    }
    next();
  };
}

module.exports = { requireRoles };
