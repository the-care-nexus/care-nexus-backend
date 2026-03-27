const httpStatus = require("http-status");
const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");
const authService = require("./auth.service");

const registerPatient = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const result = await authService.registerPatient({ name, email, password });
  return res
    .status(httpStatus.CREATED)
    .json(new ApiResponse(true, "Patient registered successfully", result));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  return res.status(httpStatus.OK).json(new ApiResponse(true, "Logged in successfully", result));
});

const refreshTokens = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshTokens(refreshToken);
  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(true, "Tokens refreshed successfully", tokens));
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  await authService.logout(refreshToken);
  return res.status(httpStatus.OK).json(new ApiResponse(true, "Logged out successfully"));
});

const getMe = asyncHandler(async (req, res) => {
  return res.status(httpStatus.OK).json(
    new ApiResponse(true, "Current user", {
      id: req.user.id,
      role: req.user.role,
      status: req.user.status
    })
  );
});

module.exports = {
  registerPatient,
  login,
  refreshTokens,
  logout,
  getMe
};

