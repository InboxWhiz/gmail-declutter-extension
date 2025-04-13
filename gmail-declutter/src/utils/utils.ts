export function parseSender(raw: string): [string|null, string] {
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
  } catch (e) {
    return [null, "Unknown Sender"];
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
