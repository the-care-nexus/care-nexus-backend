const httpStatus = require("http-status");
const ApiError = require("../../utils/ApiError");
const User = require("../../models/User.model");
const PatientProfile = require("../../models/PatientProfile.model");
const { ROLES } = require("../../utils/constants");
const { generateAccessToken, generateRefreshToken } = require("../../utils/tokens");
const { getRedisClient } = require("../../config/redis");

const registerPatient = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already in use");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: ROLES.PATIENT
  });

  await PatientProfile.create({ user: user._id });

  const accessToken = generateAccessToken(user);
  const { token: refreshToken, jti } = generateRefreshToken(user);

  const redis = getRedisClient();
  await redis.set(`refresh:${jti}`, JSON.stringify({ userId: String(user._id) }), {
    EX: 7 * 24 * 60 * 60
  });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    tokens: {
      accessToken,
      refreshToken
    }
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid credentials");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid credentials");
  }

  const accessToken = generateAccessToken(user);
  const { token: refreshToken, jti } = generateRefreshToken(user);

  const redis = getRedisClient();
  await redis.set(`refresh:${jti}`, JSON.stringify({ userId: String(user._id) }), {
    EX: 7 * 24 * 60 * 60
  });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    tokens: {
      accessToken,
      refreshToken
    }
  };
};

const refreshTokens = async (refreshTokenRaw) => {
  const jwt = require("jsonwebtoken");
  const config = require("../../config/config");

  try {
    const payload = jwt.verify(refreshTokenRaw, config.jwt.refreshSecret);
    const redis = getRedisClient();
    const session = await redis.get(`refresh:${payload.jti}`);
    if (!session) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
    }
    const { userId } = JSON.parse(session);
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "User not found");
    }

    const accessToken = generateAccessToken(user);
    const { token: newRefreshToken, jti } = generateRefreshToken(user);

    await redis.del(`refresh:${payload.jti}`);
    await redis.set(`refresh:${jti}`, JSON.stringify({ userId: String(user._id) }), {
      EX: 7 * 24 * 60 * 60
    });

    return {
      accessToken,
      refreshToken: newRefreshToken
    };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
  }
};

const logout = async (refreshTokenRaw) => {
  const jwt = require("jsonwebtoken");
  const config = require("../../config/config");
  try {
    const payload = jwt.verify(refreshTokenRaw, config.jwt.refreshSecret);
    const redis = getRedisClient();
    await redis.del(`refresh:${payload.jti}`);
  } catch (err) {
    // ignore token parsing errors during logout
  }
};

module.exports = {
  registerPatient,
  login,
  refreshTokens,
  logout
};

