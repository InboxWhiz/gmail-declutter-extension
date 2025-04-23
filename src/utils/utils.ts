import { UnsubscribeData } from "../types/types";

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

export function parseListUnsubscribeHeader(
  header: string | undefined
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
    const trimmedPart = part.trim().substring(1, part.length - 1); // Remove surrounding angle brackets
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

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
