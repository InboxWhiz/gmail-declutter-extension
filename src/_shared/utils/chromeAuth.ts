/**
 * Initiates the Google sign-in process for the specified email address.
 * This function forces interactive authentication by removing any old token from the cache.
 *
 * @param expectedEmailAddress - The email address that the authenticated user is expected to have.
 * @param deps - Optional dependency overrides for testing.
 * @throws {Error} If the authenticated user's email does not match the expected email address.
 */
export async function signInWithGoogle(expectedEmailAddress: string): Promise<void> {
  // Remove any old token from the cache to force re-authentication
  await chrome.identity.clearAllCachedAuthTokens();

  // Get new token interactively
  await getValidToken(expectedEmailAddress, true);
}

/**
 * Retrieves a valid Google OAuth token, ensuring it matches the expected email address.
 *
 * @param expectedEmailAddress - The email address that the token must be associated with.
 * @param interactive - Whether to prompt the user interactively if necessary. Defaults to `false`.
 * @param deps - Optional dependencies for testing.
 * @returns A promise that resolves with the valid OAuth token if successful.
 * @throws If no token is received, if there is a runtime error, or if the token does not match the expected email address.
 */
export async function getValidToken(
  expectedEmailAddress: string,
  interactive = false,
  deps?: {
    verifyToken?: Function;
  }
): Promise<chrome.identity.GetAuthTokenResult> {
  const _verifyToken = deps?.verifyToken || verifyToken;
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, async (token) => {
      // Check for errors and make sure the token matches the expected email address
      if (chrome.runtime.lastError || !token) {
        reject(
          chrome.runtime.lastError || new Error("No OAuth token received."),
        );
      } else {
        try {
          await _verifyToken(token, expectedEmailAddress);
          resolve(token);
        } catch (err) {
          reject(err);
        }
      }
    });
  });
}

/**
 * Verifies that a Google OAuth2 access token is valid and corresponds to the expected email address.
 *
 * @param token - The OAuth2 access token to verify.
 * @param expectedEmailAddress - The email address that the authenticated user is expected to have.
 * @returns A promise that resolves to `true` if the token is valid (response status 200), or `false` otherwise.
 */
async function verifyToken(
  token: chrome.identity.GetAuthTokenResult,
  expectedEmailAddress: string,
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 200) {
        const userInfo = await res.json();
        if (userInfo.email === expectedEmailAddress) {
          resolve();
        } else {
          reject(
            new Error(
              `Authenticated user email (${userInfo.email}) does not match expected email (${expectedEmailAddress}).`,
            ),
          );
        }
      } else {
        reject(
          new Error(`Token verification failed with status ${res.status}.`),
        );
      }
    } catch (err) {
      reject(err);
    }
  });
}

export const exportForTest = {
  verifyToken,
};
