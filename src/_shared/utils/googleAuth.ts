const CLIENT_ID =
  "396720193118-mun9vgnvus9om9tpfj1tbamd2b014kaf.apps.googleusercontent.com";
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.settings.basic",
  "https://www.googleapis.com/auth/userinfo.email",
];

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
