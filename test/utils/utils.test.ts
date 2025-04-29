import {
  parseSender,
  parseListUnsubscribeHeader,
} from "../../src/sidebar/utils/utils";

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
    expect(result).toEqual(["null", "Unknown Sender"]);
  });
});

describe("parseListUnsubscribeHeader", () => {
  test("should parse a header with both posturl and mailto", () => {
    const testLink =
      "<https://example.com/unsubscribe>,<mailto:unsubscribe+example@unsubscribe.example.com>";
    const parsed = parseListUnsubscribeHeader(testLink);

    expect(parsed).toEqual({
      posturl: "https://example.com/unsubscribe",
      mailto: "unsubscribe+example@unsubscribe.example.com",
      clickurl: null,
    });
  });

  test("should parse a header with only posturl", () => {
    const testLink = "<https://example.com/unsubscribe>";
    const parsed = parseListUnsubscribeHeader(testLink);

    expect(parsed).toEqual({
      posturl: "https://example.com/unsubscribe",
      mailto: null,
      clickurl: null,
    });
  });

  test("should parse a header with only mailto", () => {
    const testLink = "<mailto:unsubscribe+example@unsubscribe.example.com>";
    const parsed = parseListUnsubscribeHeader(testLink);

    expect(parsed).toEqual({
      posturl: null,
      mailto: "unsubscribe+example@unsubscribe.example.com",
      clickurl: null,
    });
  });

  test("should parse an empty header", () => {
    const testLink = undefined;
    const parsed = parseListUnsubscribeHeader(testLink);

    expect(parsed).toEqual({
      posturl: null,
      mailto: null,
      clickurl: null,
    });
  });
});
