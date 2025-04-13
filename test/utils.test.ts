import { parseSender } from "../src/utils/utils";

describe("parseSender", () => {
  test("extracts name and email", () => {
    const result = parseSender("John Doe <john@example.com>");
    expect(result).toEqual(["john@example.com", "John Doe"]);
  });

  test("extracts name and email with no name", () => {
    const result = parseSender("aaron@example.com");
    expect(result).toEqual(["aaron@example.com", "aaron"]);
  });

  test("removes quotation marks", () => {
    const result = parseSender('"John Doe" <john@example.com>');
    expect(result).toEqual(["john@example.com", "John Doe"]);
  });

  test("extracts name and email when invalid", () => {
    const result = parseSender(null); // invalid sender
    expect(result).toEqual([null, "Unknown Sender"]);
  });
});
