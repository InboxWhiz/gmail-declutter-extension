/* global global */

import {
  fetchAllSenders,
  exportForTest,
} from "../extension/background/fetch-senders.js";
const {
  fetchMessageIds,
  fetchMessageSenderSingle,
  updateSenderCounts,
  storeSenders,
} = exportForTest;

import { getOAuthToken } from "../extension/background/auth.js";
import { sleep } from "../extension/background/utils.js";

// Mock dependencies
jest.mock("../extension/background/auth.js");
jest.mock("../extension/background/utils.js", () => {
  const originalModule = jest.requireActual("../extension/background/utils.js");
  return {
    ...originalModule,
    sleep: jest.fn(),
  };
});
global.chrome = {
  storage: {
    local: {
      set: jest.fn(),
    },
  },
};
global.fetch = jest.fn();

describe("fetchAllSenders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("calls getOAuthToken and fetches message IDs", async () => {
    // Arrange
    getOAuthToken.mockResolvedValue("mock-token");

    fetch.mockResolvedValueOnce({
      status: 200,
      json: async () => ({
        messages: [{ id: "123" }, { id: "456" }],
        nextPageToken: null,
      }),
    });

    fetch.mockResolvedValueOnce({
      status: 200,
      json: async () => ({
        payload: {
          headers: [{ name: "From", value: "sender123@example.com" }],
        },
      }),
    });

    fetch.mockResolvedValueOnce({
      status: 200,
      json: async () => ({
        payload: {
          headers: [{ name: "From", value: "sender456@example.com" }],
        },
      }),
    });

    // Act
    await fetchAllSenders();

    // Assert
    expect(getOAuthToken).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(3); // One for message ids, one for each message metadata
    expect(chrome.storage.local.set).toHaveBeenCalled();
  });

  test("handles pagination and multiple fetch calls", async () => {
    // Arrange

    getOAuthToken.mockResolvedValue("mock-token");

    // First response with a nextPageToken
    fetch.mockResolvedValueOnce({
      json: async () => ({
        messages: [{ id: "123" }],
        nextPageToken: "next-page",
      }),
    });

    // Second response with no nextPageToken
    fetch.mockResolvedValueOnce({
      json: async () => ({
        messages: [{ id: "456" }],
        nextPageToken: null,
      }),
    });

    // Metadata request
    fetch.mockResolvedValueOnce({
      json: async () => ({
        payload: {
          headers: [{ name: "From", value: "sender1@example.com" }],
        },
      }),
    });

    fetch.mockResolvedValueOnce({
      json: async () => ({
        payload: {
          headers: [{ name: "From", value: "sender2@example.com" }],
        },
      }),
    });

    // Act
    await fetchAllSenders();

    // Assert
    expect(fetch).toHaveBeenCalledTimes(4);
    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      senders: [
        ["sender1@example.com", "sender1", 1],
        ["sender2@example.com", "sender2", 1],
      ],
    });
  });

  test("handles rate limiting (429 Too Many Requests)", async () => {
    // Arrange
    getOAuthToken.mockResolvedValue("mock-token");

    // First response: rate limit hit
    fetch.mockResolvedValueOnce({ status: 429 });
    // Second response: successful message fetch
    fetch.mockResolvedValueOnce({
      json: async () => ({
        messages: [{ id: "123" }],
        nextPageToken: null,
      }),
    });

    // Metadata request
    fetch.mockResolvedValueOnce({
      json: async () => ({
        payload: {
          headers: [{ name: "From", value: "sender@example.com" }],
        },
      }),
    });

    // Act
    await fetchAllSenders();

    // Assert
    expect(sleep).toHaveBeenCalledWith(1000);
    expect(fetch).toHaveBeenCalledTimes(3);
  });
});

describe("fetchMessageIds", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("fetches email IDs and handles pagination", async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({
        messages: [{ id: "abc123" }, { id: "xyz456" }],
        nextPageToken: "next-page-token",
      }),
    });

    const result = await fetchMessageIds("mock-token", null);

    expect(result).toEqual({
      messageIds: ["abc123", "xyz456"],
      nextPage: "next-page-token",
    });
  });

  test("handles rate limiting (429 Too Many Requests)", async () => {
    // Arrange
    fetch.mockResolvedValueOnce({ status: 429 });
    fetch.mockResolvedValueOnce({
      json: async () => ({
        messages: [{ id: "abc123" }, { id: "xyz456" }],
        nextPageToken: "next-page-token",
      }),
    });

    // Act
    const result = await fetchMessageIds("mock-token", null);

    // Assert
    expect(sleep).toHaveBeenCalledWith(1000);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      messageIds: ["abc123", "xyz456"],
      nextPage: "next-page-token",
    });
  });
});

describe("fetchMessageSenderSingle", () => {
  test("fetches sender metadata correctly", async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({
        payload: {
          headers: [{ name: "From", value: "Test <test@example.com>" }],
        },
      }),
    });

    const sender = await fetchMessageSenderSingle("mock-token", "123");

    expect(sender).toStrictEqual(["test@example.com", "Test"]);
  });

  test("returns 'Unknown Sender' when no From header is found", async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({
        payload: {
          headers: [],
        },
      }),
    });

    const sender = await fetchMessageSenderSingle("mock-token", "123");

    expect(sender).toStrictEqual([null, "Unknown Sender"]);
  });
});

describe("updateSenderCounts", () => {
  test("correctly increments sender counts", () => {
    // Arrange
    const senders = {};

    // Act
    updateSenderCounts(
      [
        ["a@example.com", "Alice"],
        ["b@example.com", "Bob"],
        ["a@example.com", "Alice"],
      ],
      senders,
    );

    // Assert
    expect(senders).toEqual({
      "a@example.com": { name: new Set(["Alice"]), count: 2 },
      "b@example.com": { name: new Set(["Bob"]), count: 1 },
    });
  });

  test("correctly increments sender counts with the same sender having multiple names", () => {
    // Arrange
    const senders = {};

    // Act
    updateSenderCounts(
      [
        ["a@example.com", "Alice"],
        ["b@example.com", "Bob"],
        ["a@example.com", "Alice - Newsletter"],
      ],
      senders,
    );

    // Assert
    expect(senders).toEqual({
      "a@example.com": {
        name: new Set(["Alice", "Alice - Newsletter"]),
        count: 2,
      },
      "b@example.com": { name: new Set(["Bob"]), count: 1 },
    });
  });
});

describe("storeSenders", () => {
  test("calls chrome.storage.local.set with parsed and sorted senders", () => {
    // Act
    storeSenders({
      "alice@example.com": { count: 3, name: new Set(["alice"]) },
      "bob@example.com": { count: 5, name: new Set(["bob"]) },
    });

    // Assert
    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      senders: [
        ["bob@example.com", "bob", 5],
        ["alice@example.com", "alice", 3],
      ],
    });
  });

  test("uses shortest sender name", () => {
    // Act
    storeSenders({
      "alice@example.com": {
        count: 3,
        name: new Set(["Alice - Newsletter", "alice"]),
      },
      "bob@example.com": { count: 5, name: new Set(["bob"]) },
    });

    // Assert
    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      senders: [
        ["bob@example.com", "bob", 5],
        ["alice@example.com", "alice", 3],
      ],
    });
  });
});
