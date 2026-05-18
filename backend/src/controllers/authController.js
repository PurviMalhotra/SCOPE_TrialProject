const asyncHandler = require("../utils/asyncHandler");
const response = require("../utils/response");
const env = require("../config/env");
const authService = require("../services/authService");

const googleLogin = asyncHandler(async (req, res) => {
  const url = authService.getGoogleLoginUrl();
  return res.redirect(url);
});

const googleCallback = asyncHandler(async (req, res) => {
  const authResult = await authService.exchangeGoogleCode(req.query.code);

  if (req.query.redirect === "json") {
    return response.success(res, authResult, "Authenticated");
  }

  const redirectUrl = new URL(env.frontendUrl);
  redirectUrl.searchParams.set("token", authResult.token);
  return res.redirect(redirectUrl.toString());
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user);
  return response.success(res, user);
});

const logout = asyncHandler(async (req, res) => {
  return response.success(res, null, "Logged out");
});

module.exports = {
  googleLogin,
  googleCallback,
  me,
  logout,
};
