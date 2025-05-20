import {
  fetchAllSenders,
  exportForTest,
} from "../../src/_shared/utils/fetchSenders";
const {
  fetchAllMessageIds,
  fetchMessageIdsPage,
  fetchMessageSenderSingle,
  updateSenders,
  storeSenders,
} = exportForTest;

// Mock dependencies
import { getValidToken } from "../../src/_shared/utils/googleAuth";
jest.mock("../../src/_shared/utils/googleAuth");
const mockToken = "mock-token";
import { sleep } from "../../src/_shared/utils/utils";
jest.mock("../../src/_shared/utils/utils", () => {
  const originalModule = jest.requireActual("../../src/_shared/utils/utils");
  return {
    ...originalModule,
    sleep: jest.fn(),
  };
});

(global as any).chrome = {
  storage: {
    local: {
      set: jest.fn(),
    },
  },
};
global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (getValidToken as jest.Mock).mockResolvedValue(mockToken);
});

describe("fetchAllSenders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("fetches message IDs and metadata, stores in chrome storage under the user's email", async () => {
    // Arrange
    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => ({
        messages: [{ id: "123" }, { id: "456" }],
        nextPageToken: null,
      }),
    });

    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => ({
        payload: {
          headers: [{ name: "From", value: "sender123@example.com" }],
        },
      }),
    });

    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => ({
        payload: {
          headers: [{ name: "From", value: "sender456@example.com" }],
        },
      }),
    });

    // Act
    await fetchAllSenders("testemail@test.com");

    // Assert
    expect(getValidToken).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(3); // One for message ids, one for each message metadata
    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      "testemail@test.com": {
        senders: [
          ["sender123@example.com", "sender123", 1, "123"],
          ["sender456@example.com", "sender456", 1, "456"],
        ],
      },
    });
  });

  test("handles pagination and multiple fetch calls", async () => {
    // Arrange

    // First response with a nextPageToken
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        messages: [{ id: "123" }],
        nextPageToken: "next-page",
      }),
    });

    // Second response with no nextPageToken
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        messages: [{ id: "456" }],
        nextPageToken: null,
      }),
    });

    // Metadata requests
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        payload: {
          headers: [{ name: "From", value: "sender1@example.com" }],
        },
      }),
    });

    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        payload: {
          headers: [{ name: "From", value: "sender2@example.com" }],
        },
      }),
    });

    // Act
    await fetchAllSenders("testemail@test.com");

    // Assert
    expect(fetch).toHaveBeenCalledTimes(4);
    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      "testemail@test.com": {
        senders: [
          ["sender1@example.com", "sender1", 1, "123"],
          ["sender2@example.com", "sender2", 1, "456"],
        ],
      },
    });
  });

  test("handles rate limiting (429 Too Many Requests)", async () => {
    // Arrange

    // First response: rate limit hit
    (fetch as jest.Mock).mockResolvedValueOnce({ status: 429 });
    // Second response: successful message fetch
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        messages: [{ id: "123" }],
        nextPageToken: null,
      }),
    });

    // Metadata request
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        payload: {
          headers: [{ name: "From", value: "sender@example.com" }],
        },
      }),
    });

    // Act
    await fetchAllSenders("testemail@test.com");

    // Assert
    expect(sleep).toHaveBeenCalledWith(1000);
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  test("periodically updates fetchProgress in chrome.storage.local during batch processing", async () => {
    // Arrange

    // Simulate 80 message IDs (2 batches of 40)
    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => ({
        messages: Array.from({ length: 80 }, (_, i) => ({ id: `id${i}` })),
        nextPageToken: null,
      }),
    });

    // Each metadata fetch returns a valid sender
    for (let i = 0; i < 80; i++) {
      (fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          payload: {
            headers: [
              { name: "From", value: `Sender${i} <sender${i}@example.com>` },
            ],
          },
        }),
      });
    }

    // Act
    await fetchAllSenders("testemail@test.com");

    // Assert
    // There should be 2 calls to chrome.storage.local.set with fetchProgress (one per batch)
    const setCalls = (chrome.storage.local.set as jest.Mock).mock.calls.filter(
      ([arg]) => arg && typeof arg === "object" && "fetchProgress" in arg
    );
    expect(setCalls.length).toBe(2);

    // The progress should increase and be between 0 and 1
    setCalls.forEach(([arg]) => {
      expect(arg.fetchProgress["testemail@test.com"]).toBeGreaterThan(0);
      expect(arg.fetchProgress["testemail@test.com"]).toBeLessThanOrEqual(1);
    });
  });
});

describe("fetchAllMessageIds", () => {
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
    const result = await fetchAllMessageIds(mockToken, mockFetchPage);

    // Assert
    expect(result).toEqual(["id1", "id2", "id3", "id4"]);
    expect(mockFetchPage).toHaveBeenCalledTimes(2);
    expect(mockFetchPage).toHaveBeenNthCalledWith(1, mockToken, null);
    expect(mockFetchPage).toHaveBeenNthCalledWith(2, mockToken, "page2");
  });

  it("works with a single page of message IDs", async () => {
    // Arrange
    const mockFetchPage = jest.fn().mockResolvedValueOnce({
      messageIds: ["id1", "id2"],
      nextPage: null,
    });

    // Act
    const result = await fetchAllMessageIds(mockToken, mockFetchPage);

    // Assert
    expect(result).toEqual(["id1", "id2"]);
    expect(mockFetchPage).toHaveBeenCalledTimes(1);
  });

  it("returns an empty array if there are no messages", async () => {
    // Arrange
    const mockFetchPage = jest.fn().mockResolvedValueOnce({
      messageIds: [],
      nextPage: null,
    });

    // Act
    const result = await fetchAllMessageIds(mockToken, mockFetchPage);

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

describe("fetchMessageSenderSingle", () => {
  test("fetches sender metadata correctly", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        payload: {
          headers: [{ name: "From", value: "Test <test@example.com>" }],
        },
      }),
    });

    const sender = await fetchMessageSenderSingle(mockToken, "123");

    expect(sender).toStrictEqual({
      senderEmail: "test@example.com",
      senderName: "Test",
      messageId: "123",
    });
  });

  test("returns 'Unknown Sender' when no From header is found", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        payload: {
          headers: [],
        },
      }),
    });

    const sender = await fetchMessageSenderSingle(mockToken, "123");

    expect(sender).toStrictEqual({
      senderEmail: "null",
      senderName: "Unknown Sender",
      messageId: "123",
    });
  });
});

/* jscpd:ignore-start */
describe("updateSenders", () => {
  test("correctly increments sender counts and sets first message ID", () => {
    // Arrange
    const senders = {};

    // Act
    updateSenders(
      [
        { senderEmail: "a@example.com", senderName: "Alice", messageId: "1" },
        { senderEmail: "b@example.com", senderName: "Bob", messageId: "2" },
        { senderEmail: "a@example.com", senderName: "Alice", messageId: "3" },
      ],
      senders
    );

    // Assert
    expect(senders).toEqual({
      "a@example.com": {
        name: new Set(["Alice"]),
        count: 2,
        latestMessageId: "1",
      },
      "b@example.com": {
        name: new Set(["Bob"]),
        count: 1,
        latestMessageId: "2",
      },
    });
  });

  test("correctly increments sender counts with the same sender having multiple names", () => {
    // Arrange
    const senders = {};

    // Act
    updateSenders(
      [
        { senderEmail: "a@example.com", senderName: "Alice", messageId: "1" },
        { senderEmail: "b@example.com", senderName: "Bob", messageId: "2" },
        {
          senderEmail: "a@example.com",
          senderName: "Alice - Newsletter",
          messageId: "3",
        },
      ],
      senders
    );

    // Assert
    expect(senders).toEqual({
      "a@example.com": {
        name: new Set(["Alice", "Alice - Newsletter"]),
        count: 2,
        latestMessageId: "1",
      },
      "b@example.com": {
        name: new Set(["Bob"]),
        count: 1,
        latestMessageId: "2",
      },
    });
  });
});
/* jscpd:ignore-end */

describe("storeSenders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("calls chrome.storage.local.set with parsed and sorted senders", () => {
    // Act
    storeSenders(
      {
        "alice@example.com": {
          count: 3,
          name: new Set(["alice"]),
          latestMessageId: "1",
        },
        "bob@example.com": {
          count: 5,
          name: new Set(["bob"]),
          latestMessageId: "2",
        },
      },
      "testemail@test.com"
    );

    // Assert
    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      "testemail@test.com": {
        senders: [
          ["bob@example.com", "bob", 5, "2"],
          ["alice@example.com", "alice", 3, "1"],
        ],
      },
    });
  });

  test("uses shortest sender name", () => {
    // Act
    storeSenders(
      {
        "alice@example.com": {
          count: 4,
          name: new Set(["Alice - Newsletter", "alice"]),
          latestMessageId: "1",
        },
        "bob@example.com": {
          count: 8,
          name: new Set(["bob"]),
          latestMessageId: "2",
        },
      },
      "testemail@test.com"
    );

    // Assert
    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      "testemail@test.com": {
        senders: [
          ["bob@example.com", "bob", 8, "2"],
          ["alice@example.com", "alice", 4, "1"],
        ],
      },
    });
  });
});
