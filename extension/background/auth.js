export async function getOAuthToken(interactive = true) {
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
