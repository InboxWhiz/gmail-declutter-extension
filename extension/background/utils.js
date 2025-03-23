export function parseSender([raw, count]) {
  try {
    let name, email;
    if (raw.includes("<")) {
      name = raw.split("<")[0].trim();
      email = raw.split("<")[1].trim().slice(0, -1);
    } else {
      name = raw.split("@")[0].trim();
      email = raw;
    }
    return [email, name, count];
  } catch (e) {
    console.error("Error parsing sender:", raw, e);
    return [raw, raw, count];
  }
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
