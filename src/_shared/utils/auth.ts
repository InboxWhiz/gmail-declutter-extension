export async function getOAuthToken(
  interactive = true,
): Promise<chrome.identity.GetAuthTokenResult> {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (token) => {
      if (chrome.runtime.lastError || !token) {
        reject(
          chrome.runtime.lastError || { message: "No OAuth token received." },
        );
        return;
      }
      resolve(token);
    });
  });
}

/**
 * Retrieves the authenticated user's email address using the Gmail API.
 */
export function getAuthenticatedEmail(
  token: chrome.identity.GetAuthTokenResult,
): Promise<string> {
  return new Promise((resolve, reject) => {
    fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          reject(new Error("Failed to fetch user info"));
          return;
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.emailAddress) {
          resolve(data.emailAddress);
        } else {
          reject(new Error("Email address not found in response"));
        }
      })
      .catch((error) => reject(error));
  });
}
