const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const config = require("../config/config");

const generateAccessToken = (user) => {
  const payload = {
    sub: user._id,
    role: user.role,
    status: user.status
  };

  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn
  });
};

const generateRefreshToken = (user, sessionId = null) => {
  const jti = sessionId || uuidv4();
  const payload = {
    sub: user._id,
    jti
  };

  const token = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn
  });

  return { token, jti };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken
};

