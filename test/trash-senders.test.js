// eslint-disable-file no-redeclare
/* global global */

import {
  trashMultipleSenders,
  exportForTest,
} from "../extension/background/trash-senders.js";
const { trashSender } = exportForTest;

// Mock dependencies
const mockToken = "mock-token";
const getOAuthToken = jest.fn().mockResolvedValue(mockToken);
global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe("trashMultipleSenders", () => {
  test("calls trashSender for each sender", async () => {
    // Arrange
    const senders = ["test1@example.com", "test2@example.com"];
    const mockTrashSender = jest
      .fn()
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(5);

    // Act
    const result = await trashMultipleSenders(
      senders,
      mockTrashSender,
      getOAuthToken,
    );

    // Assert
    expect(result).toBe(8);
    expect(getOAuthToken).toHaveBeenCalledTimes(1);
    expect(mockTrashSender).toHaveBeenCalledTimes(2);
    expect(mockTrashSender).toHaveBeenCalledWith(
      mockToken,
      "test1@example.com",
    );
    expect(mockTrashSender).toHaveBeenCalledWith(
      mockToken,
      "test2@example.com",
    );
  });
});

describe("trashSender", () => {
  test("correctly constructs and sends fetch request to trash messages", async () => {
    // Arrange
    const senderEmail = "test@example.com";
    const mockResponse = {
      messages: [{ id: "123" }, { id: "456" }],
    };
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
    });

    // Act
    const result = await trashSender(mockToken, senderEmail);

    // Assert: Check that search request is correct
    expect(fetch).toHaveBeenCalledWith(
      `https://www.googleapis.com/gmail/v1/users/me/messages?q=from:${encodeURIComponent(senderEmail)}&maxResults=500`,
      expect.objectContaining({
        headers: {
          Authorization: `Bearer ${mockToken}`,
          "Content-Type": "application/json",
        },
      }),
    );

    // Assert: Check that trash request is correct for each message
    expect(fetch).toHaveBeenCalledWith(
      `https://www.googleapis.com/gmail/v1/users/me/messages/123/trash`,
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: `Bearer ${mockToken}`,
          "Content-Type": "application/json",
        },
      }),
    );
    expect(fetch).toHaveBeenCalledWith(
      `https://www.googleapis.com/gmail/v1/users/me/messages/456/trash`,
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: `Bearer ${mockToken}`,
          "Content-Type": "application/json",
        },
      }),
    );

    // Assert: Check that the output matches expectation
    expect(result).toBe(2);
  });

  test("handles error when fetch fails", async () => {
    // Arrange
    const senderEmail = "test@example.com";
    fetch.mockRejectedValueOnce(new Error("Network error"));

    // Act & Assert: Expect rejection to be handled
    await expect(trashSender(mockToken, senderEmail)).rejects.toThrow(
      "Network error",
    );
  });
});
