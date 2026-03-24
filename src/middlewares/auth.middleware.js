const jwt = require("jsonwebtoken");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");
const User = require("../models/User.model");
const { USER_STATUS } = require("../utils/constants");

// Authenticates using Bearer access token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Authentication token missing");
    }

    const payload = jwt.verify(token, config.jwt.accessSecret);

    const user = await User.findById(payload.sub);
    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "User not found");
    }

    if (user.status === USER_STATUS.SUSPENDED) {
      throw new ApiError(httpStatus.FORBIDDEN, "Account is suspended");
    }

    req.user = {
      id: user._id,
      role: user.role,
      status: user.status
    };

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new ApiError(httpStatus.UNAUTHORIZED, "Access token expired"));
    }
    if (err instanceof ApiError) {
      return next(err);
    }
    return next(new ApiError(httpStatus.UNAUTHORIZED, "Invalid authentication token"));
  }
};

const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return next(new ApiError(httpStatus.FORBIDDEN, "You are not allowed to perform this action"));
  }
  return next();
};

module.exports = {
  authenticate,
  authorizeRoles
};

