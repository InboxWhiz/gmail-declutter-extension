/* eslint-disable @typescript-eslint/no-unsafe-function-type */
const CLIENT_ID =
  "396720193118-mun9vgnvus9om9tpfj1tbamd2b014kaf.apps.googleusercontent.com";
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.settings.basic",
  "https://www.googleapis.com/auth/userinfo.email",
];
const TOKEN_LIFESPAN = 3600 * 1000; // 1 hour

/**
 * Retrieves a valid OAuth token for the specified email address.
 *
 * This function first attempts to retrieve a cached token. If a valid cached token exists,
 * it verifies the token and returns it. If the cached token is missing, expired, or invalid,
 * it initiates a new authentication flow to obtain a fresh token, caches it, and returns it.
 *
 * @param emailAddress - The email address for which to retrieve the token.
 * @param deps - Optional dependency overrides for testing.
 * @param deps.getCachedToken - Optional function to retrieve a cached token for the email address.
 * @param deps.verifyToken - Optional function to verify the validity of a token.
 * @param deps.signInWithGoogle - Optional function to initiate the Google sign-in flow.
 * @param deps.cacheToken - Optional function to cache a token for the email address.
 * @returns A promise that resolves to a valid OAuth token as a string.
 */
export async function getValidToken(
  emailAddress: string,
  deps?: {
    getCachedToken?: Function;
    verifyToken?: Function;
    signInWithGoogle?: Function;
  },
): Promise<string> {
  const {
    getCachedToken: _getCachedToken = getCachedToken,
    verifyToken: _verifyToken = verifyToken,
    signInWithGoogle: _signInWithGoogle = signInWithGoogle,
  } = deps || {};

  const cached = await _getCachedToken(emailAddress);

  if (cached && Date.now() < cached.expiresAt) {
    const isValid = await _verifyToken(cached.token);
    if (isValid) {
      return cached.token;
    }
  }

  const { token: newToken } = await _signInWithGoogle(emailAddress);
  return newToken;
}

/**
 * Initiates the Google sign-in process for the specified email address.
 *
 * @param expectedEmailAddress - The email address that the authenticated user is expected to have.
 * @param deps - Optional dependency overrides for testing.
 * @param deps.buildAuthUrl - Optional function to build the Google OAuth authorization URL.
 * @param deps.launchWebAuthFlow - Optional function to launch the Chrome Identity Web Authentication flow.
 * @param deps.fetchUserEmail - Optional function to fetch the authenticated user's email address.
 * @returns A promise that resolves to an object containing the authentication token and the user's email address.
 * @throws {Error} If the authenticated user's email does not match the expected email address.
 */
export async function signInWithGoogle(
  expectedEmailAddress: string,
  deps?: {
    buildAuthUrl?: Function;
    launchWebAuthFlow?: Function;
    fetchUserEmail?: Function;
    cacheToken?: Function;
  },
): Promise<{ token: string; email: string }> {
  const {
    buildAuthUrl: _buildAuthUrl = buildAuthUrl,
    launchWebAuthFlow: _launchWebAuthFlow = launchWebAuthFlow,
    fetchUserEmail: _fetchUserEmail = fetchUserEmail,
    cacheToken: _cacheToken = cacheToken,
  } = deps || {};

  const authUrl = _buildAuthUrl(expectedEmailAddress);
  const token = await _launchWebAuthFlow(authUrl);
  const email = await _fetchUserEmail(token);

  if (email.toLowerCase() !== expectedEmailAddress.toLowerCase()) {
    throw new Error(`Wrong email: ${email}`);
  }

  await _cacheToken(expectedEmailAddress, token);
  return { token, email };
}

/**
 * Builds a Google OAuth 2.0 authorization URL for the specified email address.
 *
 * @param expectedEmailAddress - The email address to use as a login hint for the OAuth flow.
 * @returns The complete Google OAuth 2.0 authorization URL as a string.
 */
function buildAuthUrl(expectedEmailAddress: string): string {
  const REDIRECT_URI = chrome.identity.getRedirectURL();
  return (
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${encodeURIComponent(CLIENT_ID)}` +
    `&response_type=token` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=${encodeURIComponent(SCOPES.join(" "))}` +
    `&login_hint=${encodeURIComponent(expectedEmailAddress)}` +
    `&prompt=consent`
  );
}

/**
 * Launches a Chrome Identity Web Authentication flow using the provided authorization URL.
 *
 * Opens an interactive authentication window for the user to authorize access and retrieves the access token
 * from the redirect URL fragment upon successful authentication.
 *
 * @param authUrl - The OAuth2 authorization URL to initiate the authentication flow.
 * @returns A promise that resolves with the access token as a string if authentication is successful,
 * or rejects with an error if the authentication fails or the access token is not found.
 */
function launchWebAuthFlow(authUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      { url: authUrl, interactive: true },
      (redirectUrl) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (redirectUrl) {
          const fragment = new URLSearchParams(
            new URL(redirectUrl).hash.slice(1),
          );
          const token = fragment.get("access_token");
          if (token) {
            resolve(token);
          } else {
            reject(new Error("Access token not found in redirect URL."));
          }
        } else {
          reject(new Error("Authorization failed."));
        }
      },
    );
  });
}

/**
 * Fetches the authenticated user's email address from the Google OAuth2 API.
 *
 * @param token - The OAuth2 access token used for authentication.
 * @returns A promise that resolves to the user's email address as a string.
 * @throws {Error} If the request to fetch user info fails.
 */
async function fetchUserEmail(token: string): Promise<string> {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch user info");
  }

  const data = await res.json();
  return data.email;
}

/**
 * Caches a Google authentication token for a specific email address in Chrome's local storage.
 *
 * @param emailAddress - The email address to associate with the cached token.
 * @param token - The Google authentication token to cache.
 * @returns A promise that resolves when the token has been cached.
 */
async function cacheToken(emailAddress: string, token: string): Promise<void> {
  const existing =
    (await chrome.storage.local.get("googleAuth")).googleAuth || {};
  await chrome.storage.local.set({
    googleAuth: {
      ...existing,
      [emailAddress]: {
        token,
        expiresAt: Date.now() + TOKEN_LIFESPAN,
      },
    },
  });
}

/**
 * Retrieves a cached Google authentication token and its expiration time for a given email address from Chrome's local storage.
 *
 * @param email - The email address associated with the cached token.
 * @returns A promise that resolves to an object containing the token and its expiration timestamp,
 *          or `null` if no valid cached token is found for the specified email.
 */
export async function getCachedToken(
  email: string,
): Promise<{ token: string; expiresAt: number } | null> {
  const data = await chrome.storage.local.get("googleAuth");
  const user = data.googleAuth?.[email];

  if (!user || !user.token || !user.expiresAt) {
    return null;
  }

  return {
    token: user.token,
    expiresAt: user.expiresAt,
  };
}

/**
 * Verifies the validity of a Google OAuth2 access token by making a request to the Google UserInfo API.
 *
 * @param token - The OAuth2 access token to verify.
 * @returns A promise that resolves to `true` if the token is valid (response status 200), or `false` otherwise.
 */
async function verifyToken(token: string): Promise<boolean> {
  try {
    const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.status === 200;
  } catch {
    return false;
  }
}

export const exportForTest = {
  buildAuthUrl,
  launchWebAuthFlow,
  fetchUserEmail,
  cacheToken,
  verifyToken,
};
