import { getValidToken } from "../../_shared/utils/googleAuth";
import { sleep, parseListUnsubscribeHeader } from "./utils";
import { UnsubscribeData } from "../types/types";

/**
 * Retrieves unsubscribe data from multiple email messages.
 *
 * @param messageIds - An array of Gmail message IDs to fetch unsubscribe data for.
 * @param accountEmail - The email address of the user whose token will be used for authentication.
 * @param getUnsubscribeDataFunc - (Optional) A function to fetch unsubscribe data for a single message. Defaults to `getUnsubscribeData`.
 * @returns A promise that resolves to an array of `UnsubscribeData` objects, each corresponding to a message ID.
 */
export async function getMultipleUnsubscribeData(
  messageIds: string[],
  accountEmail: string,
  getUnsubscribeDataFunc = getUnsubscribeData,
): Promise<UnsubscribeData[]> {
  const token = await getValidToken(accountEmail);
  const unsubscribeData: UnsubscribeData[] = [];

  for (const messageId of messageIds) {
    const data = await getUnsubscribeDataFunc(messageId, token);
    unsubscribeData.push(data);
  }

  return unsubscribeData;
}

/**
 * Sends a POST request to the specified URL to perform an unsubscribe action.
 *
 * @param url - The URL to which the POST request should be sent for unsubscribing.
 * @throws Will throw an error if the response is not successful.
 * @returns A promise that resolves when the unsubscribe action is completed successfully.
 */
export async function unsubscribeUsingPostUrl(url: string): Promise<void> {
  const response = await fetch(url, { method: "POST" });

  if (!response.ok) {
    throw new Error(
      `Failed to unsubscribe using POST URL: ${response.status} ${response.statusText}`,
    );
  }
  console.log(`Unsubscribed using POST URL: ${url}`);
}

/**
 * Sends an unsubscribe email using the Gmail API and a provided mailto email address.
 *
 * This function retrieves a valid OAuth token for the specified user, constructs an email message
 * to the given mailto address, and sends it via the Gmail API to attempt to unsubscribe the user.
 *
 * @param mailtoEmail - The email address to send the unsubscribe request to (usually from a "mailto" unsubscribe link).
 * @param accountEmail - The email address of the user performing the unsubscribe action.
 * @throws Will throw an error if the Gmail API request fails.
 */
export async function unsubscribeUsingMailTo(mailtoEmail: string, accountEmail: string) {
  // Get OAuth token
  const token = await getValidToken(accountEmail);

  // Create message
  const message: string = buildEmailMessage(mailtoEmail, );

  // Send message using Gmail API
  const response = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw: message }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Gmail API error: ${response.status} ${response.statusText}`,
    );
  }
  console.log(`Unsubscribed using mailto: ${mailtoEmail}`);
}

/**
 * Retrieves unsubscribe information for a given email message by first checking the message headers
 * for standard unsubscribe data (mailto or post URLs). If no mailto link is found in the headers,
 * it attempts to extract a clickable unsubscribe link from the email body.
 *
 * @param messageId - The unique identifier of the email message to process.
 * @param token - An authentication token required to access the email data.
 * @param getHeader - (Optional) A function to extract unsubscribe data from the message headers. Defaults to `getListUnsubscribeHeader`.
 * @param getClickLink - (Optional) A function to extract an unsubscribe link from the message body. Defaults to `getUnsubscribeLinkFromBody`.
 * @returns A promise that resolves to an `UnsubscribeData` object containing available unsubscribe methods (mailto, posturl, clickurl).
 */
async function getUnsubscribeData(
  messageId: string,
  token: any,
  getHeader = getListUnsubscribeHeader,
  getClickLink = getUnsubscribeLinkFromBody,
): Promise<UnsubscribeData> {
  const headerData: UnsubscribeData = await getHeader(messageId, token);

  // Return if we have a mailto link in the header
  if (headerData.mailto) {
    return headerData;
  }

  // If no unsubscribe data found in headers, look for a link in the email body
  const unsubscribeLink = await getClickLink(messageId, token);
  return {
    posturl: headerData.posturl,
    mailto: headerData.mailto,
    clickurl: unsubscribeLink,
  };
}

/**
 * Retrieves and parses the "List-Unsubscribe" header from a specific Gmail message.
 *
 * @param messageId - The Gmail ID of the message to inspect.
 * @param token - The OAuth2 access token used for authenticating the Gmail API request.
 * @returns A promise that resolves to an `UnsubscribeData` object containing parsed unsubscribe information,
 *          or empty values if the header is not found or an error occurs.
 *
 * @remarks
 * - Handles Gmail API rate limiting by retrying the request after a delay if a 429 status is encountered.
 * - Utilizes the Gmail API to fetch only the "List-Unsubscribe" header for efficiency.
 * - Returns default empty unsubscribe data if the request fails.
 */
async function getListUnsubscribeHeader(
  messageId: string,
  token: any,
): Promise<UnsubscribeData> {
  try {
    // Get the List-Unsubscribe header for a specific message
    const url = `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=metadata&metadataHeaders=List-Unsubscribe`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // Handle rate limiting
    if (response.status === 429) {
      console.warn("Rate limit hit. Pausing...");
      await sleep(1000);
      return await getListUnsubscribeHeader(token, messageId); // Retry
    }

    // Get the List-Unsubscribe header from the response
    const data = await response.json();
    const header = data.payload?.headers?.find(
      (header: { name: string }) => header.name === "List-Unsubscribe",
    )?.value;

    // Parse the List-Unsubscribe header and return the data
    const parsedHeader = parseListUnsubscribeHeader(header);
    return parsedHeader;
  } catch (error) {
    console.error(
      `Error getting List-Unsubscribe header for message ${messageId}:`,
      error,
    );
    return { posturl: null, mailto: null, clickurl: null }; // Return empty data on error
  }
}

/**
 * Retrieves the clickable unsubscribe link from the HTML body of a Gmail message.
 *
 * This function fetches the full message using the Gmail API, decodes the HTML body,
 * and attempts to extract an unsubscribe link from an anchor tag with the text "unsubscribe".
 * If the Gmail API rate limit is hit (HTTP 429), the function waits and retries automatically.
 *
 * @param messageId - The The Gmail ID of the message to inspect.
 * @param token - The OAuth 2.0 access token for authenticating with the Gmail API.
 * @returns A promise that resolves to the unsubscribe link as a string, or `null` if not found or on error.
 */
async function getUnsubscribeLinkFromBody(
  messageId: string,
  token: any,
): Promise<string | null> {
  try {
    const url = `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 429) {
      console.warn("Rate limit hit. Pausing...");
      await sleep(1000);
      return await getUnsubscribeLinkFromBody(messageId, token); // Retry
    }

    const data = await response.json();
    const body = data.payload?.parts?.find(
      (part: { mimeType: string }) => part.mimeType === "text/html",
    )?.body?.data;

    if (!body) {
      return null; // No HTML body found
    }

    // Decode base64url encoded body
    const decodedBody = atob(body.replace(/-/g, "+").replace(/_/g, "/"));

    // Extract unsubscribe link from the HTML body
    const match = decodedBody.match(
      /<a[^>]+href="([^"]+)"[^>]*>unsubscribe<\/a>/i,
    );

    return match ? match[1] : null; // Return the link or null if not found
  } catch (error) {
    console.error(
      `Error getting unsubscribe link from body for message ${messageId}:`,
      error,
    );
    return null; // Return null on error
  }
}

/**
 * Constructs and encodes an email message to send to the recipient for unsubscribing, formatted for Gmail API usage.
 *
 * @param recipient - The email address to which the unsubscribe message will be sent.
 * @returns The base64url-encoded email message as a string.
 */
function buildEmailMessage(recipient: string) {
  const rawLines = [
    `To: ${recipient}`,
    "Subject: unsubscribe",
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    "This message was automatically generated by InboxWhiz.",
  ];
  const raw = rawLines.join("\r\n");

  // Encode message
  const encoded = btoa(decodeURIComponent(encodeURIComponent(raw)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return encoded;
}

export const exportForTest = {
  getListUnsubscribeHeader,
  getUnsubscribeLinkFromBody,
  getUnsubscribeData,
};
