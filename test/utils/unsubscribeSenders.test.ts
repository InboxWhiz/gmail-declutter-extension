import {
  exportForTesting,
  getMultipleUnsubscribeData,
  unsubscribeUsingMailTo,
  unsubscribeUsingPostUrl,
  getUnsubscribeData
} from "../../src/utils/unsubscribeSenders";
const { parseListUnsubscribeHeader, getUnsubscribeLinkFromBody } =
  exportForTesting;

// Mock dependencies
import { getOAuthToken } from "../../src/utils/auth";
jest.mock("../../src/utils/auth", () => ({
  getOAuthToken: jest.fn(),
}));

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

describe("getUnsubscribeLinkFromBody", () => {
  const messageId = "msg-id";
  const token = "test-token";

  // Helper to Base64-encode HTML
  const htmlToBase64 = (html: string) =>
    Buffer.from(html, "utf-8").toString("base64");

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("returns the first unsubscribe link from HTML body", async () => {
    // Arrange
    const html = '<a href="https://example.com/unsubscribe">Unsubscribe</a>';
    const encoded = htmlToBase64(html);
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: () =>
        Promise.resolve({
          payload: {
            parts: [{ mimeType: "text/html", body: { data: encoded } }],
          },
        }),
    });

    // Act
    const result = await getUnsubscribeLinkFromBody(messageId, token);

    // Assert
    expect(result).toBe("https://example.com/unsubscribe");
  });

  it("matches unsubscribe case-insensitively", async () => {
    const html = '<a href="https://example.com/unsubscribe">UNSUBSCRIBE</a>';
    const encoded = htmlToBase64(html);
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: () =>
        Promise.resolve({
          payload: {
            parts: [{ mimeType: "text/html", body: { data: encoded } }],
          },
        }),
    });

    const result = await getUnsubscribeLinkFromBody(messageId, token);
    expect(result).toBe("https://example.com/unsubscribe");
  });

  it("ignores non-unsubscribe links and returns the correct one", async () => {
    // Arrange
    const html = `
      <a href="https://not-it.com">Click here</a>
      <a href="https://good.com/unsub">unsubscribe</a>
      <a href="https://also-ignore.com">foo</a>
    `;
    const encoded = htmlToBase64(html);
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: () =>
        Promise.resolve({
          payload: {
            parts: [{ mimeType: "text/html", body: { data: encoded } }],
          },
        }),
    });

    // Act
    const result = await getUnsubscribeLinkFromBody(messageId, token);

    // Assert
    expect(result).toBe("https://good.com/unsub");
  });

  it("returns null when there is no unsubscribe link", async () => {
    // Arrange
    const html = "<p>Hello world</p>";
    const encoded = htmlToBase64(html);
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: () =>
        Promise.resolve({
          payload: {
            parts: [{ mimeType: "text/html", body: { data: encoded } }],
          },
        }),
    });

    // Act
    const result = await getUnsubscribeLinkFromBody(messageId, token);

    // Assert
    expect(result).toBeNull();
  });

  it("retries and returns value after rate limit (429)", async () => {
    const html = '<a href="https://retry.com">unsubscribe</a>';
    const encoded = htmlToBase64(html);
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ status: 429 })
      .mockResolvedValueOnce({
        status: 200,
        json: () =>
          Promise.resolve({
            payload: {
              parts: [{ mimeType: "text/html", body: { data: encoded } }],
            },
          }),
      });

    const result = await getUnsubscribeLinkFromBody(messageId, token);
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(result).toBe("https://retry.com");
  });
});

describe("unsubscribeUsingPostUrl", () => {
  const testUrl = "https://example.com/unsubscribe";

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should POST to the given URL and resolve when response.ok is true", async () => {
    // Mock global.fetch to return ok
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: true });

    // Expect the promise to resolve without throwing error
    await expect(unsubscribeUsingPostUrl(testUrl)).resolves.toBeUndefined();

    // Verify fetch was called correctly
    expect((global as any).fetch).toHaveBeenCalledTimes(1);
    expect((global as any).fetch).toHaveBeenCalledWith(testUrl, {
      method: "POST",
    });
  });

  it("should throw an error with statusText when response.ok is false", async () => {
    // Mock global.fetch to return not ok
    (global as any).fetch = jest
      .fn()
      .mockResolvedValue({ ok: false, status: 400, statusText: "Bad Request" });

    // Expect the promise to reject with appropriate error message
    await expect(unsubscribeUsingPostUrl(testUrl)).rejects.toThrow(
      "Failed to unsubscribe using POST URL: 400 Bad Request"
    );

    // Verify fetch was called correctly
    expect((global as any).fetch).toHaveBeenCalledTimes(1);
    expect((global as any).fetch).toHaveBeenCalledWith(testUrl, {
      method: "POST",
    });
  });
});

describe("unsubscribeUsingMailTo", () => {
  const email = "test@example.com";
  const token = "mock-token";

  beforeEach(() => {
    (getOAuthToken as jest.Mock).mockResolvedValue(token);
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("sends a correctly formatted raw message via Gmail API", async () => {
    await expect(unsubscribeUsingMailTo(email)).resolves.toBeUndefined();

    // Verify token retrieval
    expect(getOAuthToken).toHaveBeenCalledTimes(1);

    // Verify fetch call
    const fetchMock = (global.fetch as jest.Mock).mock;
    expect(fetchMock.calls.length).toBe(1);
    const [url, options] = fetchMock.calls[0];
    expect(url).toBe(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send"
    );
    expect(options.method).toBe("POST");
    expect(options.headers.Authorization).toBe(`Bearer ${token}`);
    expect(options.headers["Content-Type"]).toBe("application/json");

    // Reconstruct expected raw and encoded values
    const rawLines = [
      `To: ${email}`,
      "Subject: unsubscribe",
      'Content-Type: text/plain; charset="UTF-8"',
      "",
      "This message was automatically generated by Gmail Declutter.",
    ];
    const raw = rawLines.join("\r\n");
    const expectedEncoded = btoa(encodeURIComponent(raw))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const body = JSON.parse(options.body);
    expect(body.raw).toBe(expectedEncoded);
  });

  it("throws an error when the Gmail API returns not ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Server Error",
    });

    await expect(unsubscribeUsingMailTo(email)).rejects.toThrow(
      "Gmail API error: 500 Server Error"
    );
    expect(getOAuthToken).toHaveBeenCalledTimes(1);
    expect((global.fetch as jest.Mock).mock.calls.length).toBe(1);
  });
});
