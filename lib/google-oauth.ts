/**
 * lib/google-oauth.ts
 *
 * Google OAuth 2.0 helpers for the Google Ads integration.
 * Uses the googleapis package's OAuth2 client.
 */

import { google } from "googleapis";

// Scopes needed for Google Ads API
const SCOPES = [
  "https://www.googleapis.com/auth/adwords",
  "openid",
  "email",
  "profile",
];

export function createOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/google/oauth/callback`;

  if (!clientId || !clientSecret) {
    throw new Error("[google-oauth] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set.");
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getAuthUrl(state: string): string {
  const oauth2 = createOAuth2Client();
  return oauth2.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent", // Always ask for consent to get a refresh token
    state,
  });
}

export async function exchangeCodeForTokens(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiry: Date;
}> {
  const oauth2 = createOAuth2Client();
  const { tokens } = await oauth2.getToken(code);

  if (!tokens.access_token || !tokens.refresh_token) {
    throw new Error("Google OAuth did not return access_token or refresh_token.");
  }

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiry: tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600_000),
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  expiry: Date;
}> {
  const oauth2 = createOAuth2Client();
  oauth2.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await oauth2.refreshAccessToken();

  return {
    accessToken: credentials.access_token!,
    expiry: credentials.expiry_date ? new Date(credentials.expiry_date) : new Date(Date.now() + 3600_000),
  };
}
