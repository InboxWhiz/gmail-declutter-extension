import { parseSender } from "../extension/background/utils.js";

test("parseSender extracts name and email", () => {
  const result = parseSender(["John Doe <john@example.com>", 5]);
  expect(result).toEqual(["john@example.com", "John Doe", 5]);
});

test("parseSender extracts name and email with no name", () => {
  const result = parseSender(["aaron@example.com", 8]);
  expect(result).toEqual(["aaron@example.com", "aaron", 8]);
});

test("parseSender extracts name and email when error", () => {
  const result = parseSender(["", 8]); // invalid sender
  expect(result).toEqual(["", "", 8]);
});
