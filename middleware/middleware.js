const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

const AuthMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "No Token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.token);
    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch (err) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Not authorized" });
  }
};

// RBAC Middleware
const Authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(StatusCodes.FORBIDDEN).json({ msg: "Unauthorized access" });
    }
    next();
  };
};

module.exports = { AuthMiddleware, Authorize };
