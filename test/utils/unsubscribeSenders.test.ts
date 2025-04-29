import {
  getMultipleUnsubscribeData,
  getUnsubscribeData,
  getListUnsubscribeHeader,
  getUnsubscribeLinkFromBody,
  unsubscribeUsingMailTo,
  unsubscribeUsingPostUrl,
} from "../../src/sidebar/utils/unsubscribeSenders";

// Mock dependencies
import { getOAuthToken } from "../../src/sidebar/utils/auth";
import { sleep, parseListUnsubscribeHeader } from "../../src/sidebar/utils/utils";
jest.mock("../../src/sidebar/utils/auth", () => ({
  getOAuthToken: jest.fn(),
}));
jest.mock("../../src/sidebar/utils/utils", () => ({
  sleep: jest.fn(),
  parseListUnsubscribeHeader: jest.fn().mockReturnValue({
    posturl: "https://example.com/posturl",
    mailto: "unsubscribe@example.com",
    clickurl: "https://example.com/clickurl",
  }),
}));
global.fetch = jest.fn();

// Test suites

describe("getMultipleUnsubscribeData", () => {
  const mockGetUnsubscribeData = jest.fn();
  const dummyToken = "token-123";

  beforeEach(() => {
    // Always resolve the token
    (getOAuthToken as jest.Mock).mockResolvedValue(dummyToken);
  });

  afterEach(() => {
    mockGetUnsubscribeData.mockReset();
    (getOAuthToken as jest.Mock).mockReset();
  });

  it("returns an empty array without calling getUnsubscribeData when given no IDs", async () => {
    // Act
    const result = await getMultipleUnsubscribeData([], mockGetUnsubscribeData);

    // Assert
    expect(getOAuthToken).toHaveBeenCalledTimes(1);
    expect(mockGetUnsubscribeData).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it("calls getUnsubscribeData once and returns its result for a single ID", async () => {
    // Arrange
    const messageId = "id1";
    const expectedData = { posturl: "P1", mailto: "M1", clickurl: "C1" };
    mockGetUnsubscribeData.mockResolvedValueOnce(expectedData);

    // Act
    const result = await getMultipleUnsubscribeData(
      [messageId],
      mockGetUnsubscribeData,
    );

    // Assert
    expect(getOAuthToken).toHaveBeenCalledTimes(1);
    expect(mockGetUnsubscribeData).toHaveBeenCalledTimes(1);
    expect(mockGetUnsubscribeData).toHaveBeenCalledWith(messageId, dummyToken);
    expect(result).toEqual([expectedData]);
  });

  it("calls getUnsubscribeData for each ID in order and returns all results", async () => {
    // Arrange
    const ids = ["idA", "idB"];
    const dataA = { posturl: "PA", mailto: null, clickurl: null };
    const dataB = { posturl: null, mailto: "MB", clickurl: null };
    mockGetUnsubscribeData
      .mockResolvedValueOnce(dataA)
      .mockResolvedValueOnce(dataB);

    // Act
    const result = await getMultipleUnsubscribeData(
      ids,
      mockGetUnsubscribeData,
    );

    // Assert
    expect(getOAuthToken).toHaveBeenCalledTimes(1);
    expect(mockGetUnsubscribeData).toHaveBeenCalledTimes(2);
    expect(mockGetUnsubscribeData.mock.calls[0]).toEqual(["idA", dummyToken]);
    expect(mockGetUnsubscribeData.mock.calls[1]).toEqual(["idB", dummyToken]);
    expect(result).toEqual([dataA, dataB]);
  });
});

describe("getUnsubscribeData", () => {
  const messageId = "msg-1";
  const token = "tok-1";
  const headerMock = jest.fn();
  const linkMock = jest.fn();

  beforeEach(() => {
    headerMock.mockReset();
    linkMock.mockReset();
  });

  it("returns headerData immediately when mailto is present", async () => {
    // Arrange: mock header data with mailto and posturl
    const headerData = { posturl: "P", mailto: "M", clickurl: null };
    headerMock.mockResolvedValue(headerData);

    // Act
    const result = await getUnsubscribeData(
      messageId,
      token,
      headerMock,
      linkMock,
    );

    // Assert
    expect(headerMock).toHaveBeenCalledWith(messageId, token);
    expect(linkMock).not.toHaveBeenCalled();
    expect(result).toEqual(headerData);
  });

  it("returns headerData immediately when only mailto is non-null", async () => {
    // Arrange: mock header data with mailto only
    const headerData = { posturl: null, mailto: "M2", clickurl: null };
    headerMock.mockResolvedValue(headerData);

    // Act
    const result = await getUnsubscribeData(
      messageId,
      token,
      headerMock,
      linkMock,
    );

    // Assert
    expect(linkMock).not.toHaveBeenCalled();
    expect(result).toEqual(headerData);
  });

  it("looks for clickurl when mailto is null", async () => {
    const headerData = { posturl: "P3", mailto: null, clickurl: null };
    const link = "L3";
    headerMock.mockResolvedValue(headerData);
    linkMock.mockResolvedValue(link);

    const result = await getUnsubscribeData(
      messageId,
      token,
      headerMock,
      linkMock,
    );

    expect(headerMock).toHaveBeenCalledWith(messageId, token);
    expect(linkMock).toHaveBeenCalledWith(messageId, token);
    expect(result).toEqual({ posturl: "P3", mailto: null, clickurl: link });
  });

  it("returns null clickurl when both header fields and body link are null", async () => {
    const headerData = { posturl: null, mailto: null, clickurl: null };
    headerMock.mockResolvedValue(headerData);
    linkMock.mockResolvedValue(null);

    const result = await getUnsubscribeData(
      messageId,
      token,
      headerMock,
      linkMock,
    );

    expect(result).toEqual({ posturl: null, mailto: null, clickurl: null });
  });
});

describe("getListUnsubscribeHeader", () => {
  const messageId = "msg123";
  const token = "mock-token";
  const expectedUrl =
    `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}` +
    "?format=metadata&metadataHeaders=List-Unsubscribe";
  const mockParsed = {
    posturl: "https://example.com/posturl",
    mailto: "unsubscribe@example.com",
    clickurl: "https://example.com/clickurl",
  };

  beforeEach(() => {
    (fetch as jest.Mock).mockReset();
  });

  it("calls fetch with correct URL and headers and returns parsed data", async () => {
    // Arrange: valid header
    const rawValue =
      "<https://example.com/posturl>,<mailto:unsubscribe@example.com>";
    const response = {
      status: 200,
      json: () =>
        Promise.resolve({
          payload: { headers: [{ name: "List-Unsubscribe", value: rawValue }] },
        }),
    };
    (fetch as jest.Mock).mockResolvedValueOnce(response);

    // Act
    const result = await getListUnsubscribeHeader(messageId, token);

    // Assert fetch call
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(expectedUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // Assert parsing
    expect(parseListUnsubscribeHeader).toHaveBeenCalledWith(rawValue);
    expect(result).toEqual(mockParsed);
  });

  it("handles missing List-Unsubscribe header gracefully", async () => {
    // Arrange: no matching header
    const response = {
      status: 200,
      json: () => Promise.resolve({ payload: { headers: [] } }),
    };
    (fetch as jest.Mock).mockResolvedValueOnce(response);

    // Act
    const result = await getListUnsubscribeHeader(messageId, token);

    // parseListUnsubscribeHeader should be called with undefined
    expect(parseListUnsubscribeHeader).toHaveBeenCalledWith(undefined);
    expect(result).toStrictEqual(mockParsed);
  });

  it("retries after HTTP 429 and then returns parsed data", async () => {
    // Arrange: first rate limit, then success
    const rawValue = "<https://retry/unsub>";
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ status: 429 })
      .mockResolvedValueOnce({
        status: 200,
        json: () =>
          Promise.resolve({
            payload: {
              headers: [{ name: "List-Unsubscribe", value: rawValue }],
            },
          }),
      });

    // Act
    const result = await getListUnsubscribeHeader(messageId, token);

    // Assert retry logic
    expect(sleep).toHaveBeenCalledWith(1000);
    expect(fetch as jest.Mock).toHaveBeenCalledTimes(2);
    expect(parseListUnsubscribeHeader).toHaveBeenCalledWith(rawValue);
    expect(result).toStrictEqual(mockParsed);
  });

  it("return null values on error", async () => {
    // Arrange: invalid JSON
    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: () => Promise.reject(new Error("json-error")),
    });

    // Act
    const result = await getListUnsubscribeHeader(messageId, token);

    // Assert
    expect(result).toEqual({ posturl: null, mailto: null, clickurl: null });
  });
});

describe("getUnsubscribeLinkFromBody", () => {
  const messageId = "msg-id";
  const token = "test-token";

  // Helper to Base64-encode HTML
  const htmlToBase64 = (html: string) =>
    Buffer.from(html, "utf-8").toString("base64");

  // Helper to mock fetch response
  const mockFetch = (html: string) => {
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
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("returns the first unsubscribe link from HTML body", async () => {
    // Arrange
    mockFetch('<a href="https://example.com/unsubscribe">Unsubscribe</a>');

    // Act
    const result = await getUnsubscribeLinkFromBody(messageId, token);

    // Assert
    expect(result).toBe("https://example.com/unsubscribe");
  });

  it("matches unsubscribe case-insensitively", async () => {
    mockFetch('<a href="https://example.com/unsubscribe">UNSUBSCRIBE</a>');

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
    mockFetch(html);

    // Act
    const result = await getUnsubscribeLinkFromBody(messageId, token);

    // Assert
    expect(result).toBe("https://good.com/unsub");
  });

  it("returns null when there is no unsubscribe link", async () => {
    // Arrange
    mockFetch("<p>Hello world</p>");

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

  it("returns null on error", async () => {
    // Arrange: simulate fetch error
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    // Act
    const result = await getUnsubscribeLinkFromBody(messageId, token);

    // Assert
    expect(result).toBeNull();
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
      "Failed to unsubscribe using POST URL: 400 Bad Request",
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
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
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
      "This message was automatically generated by InboxWhiz.",
    ];
    const raw = rawLines.join("\r\n");
    const expectedEncoded = btoa(decodeURIComponent(encodeURIComponent(raw)))
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
      "Gmail API error: 500 Server Error",
    );
    expect(getOAuthToken).toHaveBeenCalledTimes(1);
    expect((global.fetch as jest.Mock).mock.calls.length).toBe(1);
  });
});
