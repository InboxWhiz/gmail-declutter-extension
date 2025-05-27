import { UnsubscribeData } from "../types/types";

/**
 * Returns the appropriate asset URL depending on the environment.
 *
 * In a Chrome extension environment, it uses `chrome.runtime.getURL` to resolve the asset path.
 * Otherwise, it falls back to the raw path or a provided development path.
 *
 * @param prodPath - The path to the asset in the production (extension) environment.
 * @param devPath - (Optional) The path to the asset in the development environment.
 * @returns The resolved asset URL for the current environment.
 */
export const getAssetUrl = (prodPath: string, devPath?: string) => {
  if (typeof chrome !== "undefined" && chrome.runtime?.getURL) {
    return chrome.runtime.getURL(prodPath);
  }
  return devPath ?? prodPath;
};

/**
 * Parses a raw sender string (e.g., from an email header) and extracts the email address and sender name.
 *
 * @param raw - The raw sender string, which may be in the format `"Name" <email@example.com>` or just `email@example.com`.
 * @returns A tuple containing the email address and the sender name. If parsing fails or input is null, returns `["null", "Unknown Sender"]`.
 */
export function parseSender(raw: string | null): [string, string] {
  if (!raw) return ["null", "Unknown Sender"];
  try {
    let name, email;
    if (raw.includes("<")) {
      name = raw.split("<")[0].trim();
      email = raw.split("<")[1].trim().slice(0, -1);
    } else {
      name = raw.split("@")[0].trim();
      email = raw;
    }
    if (name.startsWith('"') && name.endsWith('"')) {
      name = name.slice(1, -1);
    }
    return [email, name];
  } catch {
    return ["null", "Unknown Sender"];
  }
}

/**
 * Parses the "List-Unsubscribe" email header and extracts unsubscribe information.
 *
 * The header may contain one or more unsubscribe methods (post URL and/or a mailto address),
 * separated by commas and enclosed in angle brackets. This function extracts and returns
 * the available unsubscribe methods as an `UnsubscribeData` object.
 *
 * @param header - The value of the "List-Unsubscribe" header, or `undefined` if not present.
 * @returns An `UnsubscribeData` object containing the extracted unsubscribe URL (`posturl`),
 *          mailto address (`mailto`), and a null click URL (`clickurl`). If the header is not present,
 *          all fields will be `null`.
 */
export function parseListUnsubscribeHeader(
  header: string | undefined,
): UnsubscribeData {
  const unsubscribeData: UnsubscribeData = {
    posturl: null,
    mailto: null,
    clickurl: null,
  };

  // Return empty data if header is not present
  if (!header) {
    return unsubscribeData;
  }

  const parts = header.split(",");

  for (const part of parts) {
    const trimmedPart = part
      .trim()
      .substring(1, part.length - 1)
      .trim(); // Remove surrounding angle brackets
    if (trimmedPart.startsWith("http") || trimmedPart.startsWith("https")) {
      // It's a URL
      unsubscribeData.posturl = trimmedPart; // Store the URL
    } else if (trimmedPart.startsWith("mailto:")) {
      // It's an email address
      unsubscribeData.mailto = trimmedPart.slice(7); // Store the email address, removing "mailto:" prefix
    }
  }

  return unsubscribeData;
}

/**
 * Helper function to convert a UTF-8 string into a binary string where each character represents a byte.
 *
 * @param str - The input string to convert.
 * @returns A binary string representation of the UTF-8 encoded input.
 */
export function utf8ToBinary(str: string): string {
  return new TextEncoder()
    .encode(str)
    .reduce((s, byte) => s + String.fromCharCode(byte), "");
}

/**
 * Retrieves the Gmail account associated with the currently active browser tab.
 *
 * This function sends a message to the content script of the active tab to request the current email account.
 *
 * @returns {Promise<string>} A promise that resolves to the email address string.
 * @throws Will reject the promise if there is no active tab or if a messaging error occurs.
 */
export async function getEmailAccount(): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId === undefined) {
        reject("No active tab.");
        return;
      }

      chrome.tabs.sendMessage(
        tabId,
        { action: "GET_EMAIL_ACCOUNT" },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error(
              "Could not get email account:",
              chrome.runtime.lastError,
            );
            reject(chrome.runtime.lastError.message);
          } else {
            resolve(response.result);
          }
        },
      );
    });
  });
}

/**
 * Pauses execution for a specified number of milliseconds.
 *
 * @param ms - The number of milliseconds to sleep.
 * @returns A promise that resolves after the specified delay.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
