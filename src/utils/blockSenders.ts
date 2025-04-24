import { getOAuthToken } from "./auth";

export async function blockOneSender(senderEmail: string): Promise<void> {
  const filter: gapi.client.gmail.Filter = {
    criteria: { from: senderEmail },
    action: { addLabelIds: ["TRASH"] },
  };

  const token = await getOAuthToken();
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(
      "https://www.googleapis.com/gmail/v1/users/me/settings/filters",
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify(filter),
      },
    );
    if (!response.ok) {
      throw new Error(`Failed to create block filter: ${response.statusText}`);
    }
  } catch (err) {
    console.error(`Failed to create block filter for ${senderEmail}:`, err);
    throw err;
  }
}
