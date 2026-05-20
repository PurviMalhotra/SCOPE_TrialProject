const asyncHandler = require("../utils/asyncHandler");
const response = require("../utils/response");
const AppError = require("../utils/AppError");
const env = require("../config/env");
const authService = require("../services/authService");

const authConfig = asyncHandler(async (req, res) => {
  return response.success(res, {
    googleEnabled: Boolean(
      env.google.clientId && env.google.clientSecret
    ),
    devLoginEnabled: env.enableDevAuth,
    redirectUri: env.google.callbackUrl,
  });
});

const googleLogin = asyncHandler(async (req, res) => {
  const url = authService.getGoogleLoginUrl();
  return res.redirect(url);
});

const googleCallback = asyncHandler(async (req, res) => {
  const redirectUrl = new URL(env.frontendUrl);

  if (req.query.error) {
    redirectUrl.searchParams.set(
      "auth_error",
      req.query.error_description || req.query.error
    );
    return res.redirect(redirectUrl.toString());
  }

  const authResult = await authService.exchangeGoogleCode(req.query.code);

  if (req.query.redirect === "json") {
    return response.success(res, authResult, "Authenticated");
  }

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

const devLoginJson = asyncHandler(async (req, res) => {
  if (!env.enableDevAuth) {
    throw new AppError("Dev login is disabled", 403);
  }

  const email = req.body.email || req.query.email;
  if (!email) {
    throw new AppError("email is required", 400);
  }

  const authResult = await authService.devLogin(email);
  return response.success(res, authResult, "Authenticated");
});

module.exports = {
  authConfig,
  googleLogin,
  googleCallback,
  me,
  logout,
  devLoginJson,
};
