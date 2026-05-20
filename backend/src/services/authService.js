const env = require("../config/env");
const AppError = require("../utils/AppError");
const { signToken } = require("../utils/token");
const userRepository = require("../repositories/userRepository");

const googleAuthBaseUrl = "https://accounts.google.com/o/oauth2/v2/auth";
const googleTokenUrl = "https://oauth2.googleapis.com/token";
const googleUserInfoUrl = "https://www.googleapis.com/oauth2/v2/userinfo";

const getGoogleLoginUrl = () => {
  if (!env.google.clientId) {
    throw new AppError("Google OAuth is not configured", 500);
  }

  const params = new URLSearchParams({
    client_id: env.google.clientId,
    redirect_uri: env.google.callbackUrl,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  });

  return `${googleAuthBaseUrl}?${params.toString()}`;
};

const exchangeGoogleCode = async (code) => {
  if (!code) {
    throw new AppError("Google authorization code is required", 400);
  }

  if (!env.google.clientId || !env.google.clientSecret) {
    throw new AppError("Google OAuth is not configured", 500);
  }

  const tokenResponse = await fetch(googleTokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.google.clientId,
      client_secret: env.google.clientSecret,
      redirect_uri: env.google.callbackUrl,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) {
    throw new AppError("Failed to exchange Google authorization code", 502);
  }

  const tokenData = await tokenResponse.json();
  const profileResponse = await fetch(googleUserInfoUrl, {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  if (!profileResponse.ok) {
    throw new AppError("Failed to fetch Google profile", 502);
  }

  const profile = await profileResponse.json();
  const user = await userRepository.upsertFromGoogle({
    googleId: profile.id,
    email: profile.email,
    name: profile.name,
    picture: profile.picture,
  });

  return {
    user,
    token: signToken(user),
  };
};

const getCurrentUser = async (user) => {
  const stored = await userRepository.findById(user.id);
  return stored || user;
};

const devLogin = async (email) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new AppError("No user found for that email", 404);
  }

  return {
    user,
    token: signToken(user),
  };
};

module.exports = {
  getGoogleLoginUrl,
  exchangeGoogleCode,
  getCurrentUser,
  devLogin,
};
