import {
  fetchMessageIds,
  exportForTest,
} from "../../src/_shared/utils/fetchMessageIds";
const { fetchMessageIdsPage } = exportForTest;

const mockToken = "mock-token" as chrome.identity.GetAuthTokenResult;

import { sleep } from "../../src/_shared/utils/utils";
jest.mock("../../src/_shared/utils/utils", () => {
  const originalModule = jest.requireActual("../../src/_shared/utils/utils");
  return {
    ...originalModule,
    sleep: jest.fn(),
  };
});
global.fetch = jest.fn();

describe("fetchMessageIds", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches and combines message IDs across multiple pages", async () => {
    // Arrange
    const mockFetchPage = jest
      .fn()
      .mockResolvedValueOnce({
        messageIds: ["id1", "id2"],
        nextPage: "page2",
      })
      .mockResolvedValueOnce({
        messageIds: ["id3", "id4"],
        nextPage: null,
      });

    // Act
    const result = await fetchMessageIds(mockToken, undefined, {
      fetchMessageIdsPage: mockFetchPage,
    });

    // Assert
    expect(result).toEqual(["id1", "id2", "id3", "id4"]);
    expect(mockFetchPage).toHaveBeenCalledTimes(2);
    expect(mockFetchPage).toHaveBeenNthCalledWith(
      1,
      mockToken,
      null,
      undefined,
    );
    expect(mockFetchPage).toHaveBeenNthCalledWith(
      2,
      mockToken,
      "page2",
      undefined,
    );
  });

  it("works with a single page of message IDs", async () => {
    // Arrange
    const mockFetchPage = jest.fn().mockResolvedValueOnce({
      messageIds: ["id1", "id2"],
      nextPage: null,
    });

    // Act
    const result = await fetchMessageIds(mockToken, undefined, {
      fetchMessageIdsPage: mockFetchPage,
    });

    // Assert
    expect(result).toEqual(["id1", "id2"]);
    expect(mockFetchPage).toHaveBeenCalledTimes(1);
  });

  it("filters by sender if presented", async () => {
    // Arrange
    const mockFetchPage = jest.fn().mockResolvedValueOnce({
      messageIds: ["id1", "id2"],
      nextPage: null,
    });

    // Act
    const result = await fetchMessageIds(mockToken, "sender@example.com", {
      fetchMessageIdsPage: mockFetchPage,
    });

    // Assert
    expect(result).toEqual(["id1", "id2"]);
    expect(mockFetchPage).toHaveBeenCalledTimes(1);
    expect(mockFetchPage).toHaveBeenCalledWith(
      mockToken,
      null,
      "sender@example.com",
    );
  });

  it("returns an empty array if there are no messages", async () => {
    // Arrange
    const mockFetchPage = jest.fn().mockResolvedValueOnce({
      messageIds: [],
      nextPage: null,
    });

    // Act
    const result = await fetchMessageIds(mockToken, undefined, {
      fetchMessageIdsPage: mockFetchPage,
    });

    // Assert
    expect(result).toEqual([]);
    expect(mockFetchPage).toHaveBeenCalledTimes(1);
  });
});

describe("fetchMessageIdsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("fetches email IDs and handles pagination", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        messages: [{ id: "abc123" }, { id: "xyz456" }],
        nextPageToken: "next-page-token",
      }),
    });

    const result = await fetchMessageIdsPage(mockToken, null);

    expect(result).toEqual({
      messageIds: ["abc123", "xyz456"],
      nextPage: "next-page-token",
    });
  });

  test("fetches email IDs of a specific sender", async () => {
    // Arrange
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        messages: [{ id: "abc123" }, { id: "xyz456" }],
        nextPageToken: "next-page-token",
      }),
    });

    // Act
    const result = await fetchMessageIdsPage(
      mockToken,
      null,
      "sender@example.com",
    );

    // Assert
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("q=from:sender%40example.com"),
      expect.anything(),
    );
    expect(result).toEqual({
      messageIds: ["abc123", "xyz456"],
      nextPage: "next-page-token",
    });
  });

  test("handles rate limiting (429 Too Many Requests)", async () => {
    // Arrange
    (fetch as jest.Mock).mockResolvedValueOnce({ status: 429 });
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        messages: [{ id: "abc123" }, { id: "xyz456" }],
        nextPageToken: "next-page-token",
      }),
    });

    // Act
    const result = await fetchMessageIdsPage(mockToken, null);

    // Assert
    expect(sleep).toHaveBeenCalledWith(1000);
    expect(fetch as jest.Mock).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      messageIds: ["abc123", "xyz456"],
      nextPage: "next-page-token",
    });
  });
});
