'use strict';

const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const { google } = require('googleapis');
const calendar = google.calendar('v3');

// Use node global fetch if available, otherwise require node-fetch
const fetch = global.fetch || require('node-fetch');

const {
  CLIENT_ID,
  CLIENT_SECRET,
  CALENDAR_ID,
  AWS_REGION = 'eu-central-1',
  SECRET_NAME = 'google-oauth-tokens',
  ALLOWED_ORIGIN = '*' // set to https://maaikevp.github.io in production
} = process.env;

const SCOPES = ['https://www.googleapis.com/auth/calendar.events.public.readonly'];

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  process.env.REDIRECT_URI || 'https://maaikevp.github.io/meet/'
);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Credentials': 'true'
};

const respond = (statusCode, body) => ({
  statusCode,
  headers: CORS_HEADERS,
  body: typeof body === 'string' ? body : JSON.stringify(body),
});

// Helper to handle preflight quickly
const handleOptions = (event) => {
  if (event && (event.httpMethod === 'OPTIONS' || event.httpMethod === 'options')) {
    return respond(204, '');
  }
  return null;
};

module.exports.getAuthURL = async (event) => {
  const opts = handleOptions(event);
  if (opts) return opts;

  try {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent', // ensure refresh token on first consent
    });
    return respond(200, { authUrl });
  } catch (err) {
    console.error('getAuthURL error:', err?.message || String(err));
    return respond(500, { message: 'Failed to generate auth URL' });
  }
};

module.exports.getAccessToken = async (event) => {
  const opts = handleOptions(event);
  if (opts) return opts;

  try {
    const code = decodeURIComponent(`${event.pathParameters?.code || ''}`);
    if (!code) return respond(400, { message: 'Missing authorization code' });

    const tokenResponse = await new Promise((resolve, reject) => {
      oAuth2Client.getToken(code, (error, tokens) => {
        if (error) return reject(error);
        return resolve(tokens);
      });
    });

    // Do not log tokenResponse (contains sensitive tokens)
    return respond(200, tokenResponse);
  } catch (err) {
    console.error('getAccessToken error:', err?.message || String(err));
    return respond(500, { message: 'Token exchange failed' });
  }
};

module.exports.refreshAccessToken = async (event) => {
  const opts = handleOptions(event);
  if (opts) return opts;

  try {
    // Read refresh_token from Secrets Manager
    const secretsClient = new SecretsManagerClient({ region: AWS_REGION });
    const secretResp = await secretsClient.send(
      new GetSecretValueCommand({ SecretId: SECRET_NAME, VersionStage: 'AWSCURRENT' })
    );

    const secretString = secretResp?.SecretString || '{}';
    let parsed = {};
    try {
      parsed = JSON.parse(secretString);
    } catch (e) {
      console.error('refreshAccessToken: failed to parse secret JSON');
      return respond(500, { message: 'Invalid secret format' });
    }

    const refresh_token = parsed.refresh_token;
    if (!refresh_token) {
      return respond(500, { message: 'No refresh_token found in Secrets Manager' });
    }

    // Exchange refresh token for fresh access token
    const params = new URLSearchParams();
    params.append('client_id', CLIENT_ID || process.env.GOOGLE_CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET);
    params.append('refresh_token', refresh_token);
    params.append('grant_type', 'refresh_token');

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const tokens = await tokenRes.json();

    if (!tokenRes.ok) {
      console.error('refreshAccessToken: token endpoint error', tokens?.error || tokens);
      return respond(tokenRes.status || 500, { message: 'Token refresh failed' });
    }

    // Return access token (do not expose refresh_token)
    return respond(200, {
      accessToken: tokens.access_token,
      expiresIn: tokens.expires_in,
      scope: tokens.scope,
      tokenType: tokens.token_type,
    });
  } catch (err) {
    console.error('refreshAccessToken error:', err?.message || String(err));
    return respond(500, { message: 'Failed to refresh access token' });
  }
};

module.exports.getCalendarEvents = async (event) => {
  const opts = handleOptions(event);
  if (opts) return opts;

  try {
    const access_token = decodeURIComponent(`${event.pathParameters?.access_token || ''}`);
    if (!access_token) return respond(400, { message: 'Missing access token' });

    // Use token to fetch events (no secrets exposed)
    oAuth2Client.setCredentials({ access_token });

    const results = await new Promise((resolve, reject) => {
      calendar.events.list(
        {
          calendarId: CALENDAR_ID,
          auth: oAuth2Client,
          timeMin: new Date().toISOString(),
          singleEvents: true,
          orderBy: 'startTime',
        },
        (error, response) => {
          if (error) return reject(error);
          return resolve(response);
        }
      );
    });

    return respond(200, { events: results.data.items || [] });
  } catch (err) {
    console.error('getCalendarEvents error:', err?.message || String(err));
    return respond(500, { message: 'Failed to fetch calendar events' });
  }
};
