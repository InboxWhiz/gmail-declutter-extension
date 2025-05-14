const CLIENT_ID =
  "396720193118-mun9vgnvus9om9tpfj1tbamd2b014kaf.apps.googleusercontent.com";
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.settings.basic",
  "https://www.googleapis.com/auth/userinfo.email",
];

/**
 * Initiates the Google sign-in process for the specified email address.
 *
 * @param expectedEmailAddress - The email address that the authenticated user is expected to have.
 * @returns A promise that resolves to an object containing the authentication token and the user's email address.
 * @throws {Error} If the authenticated user's email does not match the expected email address.
 */
export async function signInWithGoogle(
  expectedEmailAddress: string
): Promise<{ token: string; email: string }> {
  const authUrl = buildAuthUrl(expectedEmailAddress);

  const token = await launchWebAuthFlow(authUrl);
  const email = await fetchUserEmail(token);

  if (email.toLowerCase() !== expectedEmailAddress.toLowerCase()) {
    throw new Error(`Wrong email: ${email}`);
  }

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
            new URL(redirectUrl).hash.slice(1)
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
      }
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
