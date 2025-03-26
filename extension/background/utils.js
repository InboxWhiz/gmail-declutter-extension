export function parseSender(raw) {
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
    console.error("Error parsing sender:", raw, e);
    return [null, "Unknown Sender"];
  }
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
