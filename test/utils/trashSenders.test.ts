import {
  trashMultipleSenders,
  exportForTest,
} from "../../src/_shared/utils/trashSenders";
const { trashSender } = exportForTest;

// Mock dependencies
import { getValidToken } from "../../src/_shared/utils/chromeAuth";
jest.mock("../../src/_shared/utils/chromeAuth");
const mockToken = "mock-token" as chrome.identity.GetAuthTokenResult;
global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (getValidToken as jest.Mock).mockResolvedValue(mockToken);
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
      "testemail@test.com",
      mockTrashSender,
    );

    // Assert
    expect(result).toBe(8);
    expect(getValidToken).toHaveBeenCalledTimes(1);
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
    (getValidToken as jest.Mock).mockResolvedValue(mockToken);
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
    });

    // Act
    const result = await trashSender(mockToken, senderEmail);

    // Assert: Check that search request is correct
    expect(fetch).toHaveBeenCalledWith(
      `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=500&q=from:${encodeURIComponent(senderEmail)}`,
      expect.objectContaining({
        headers: {
          Authorization: `Bearer ${mockToken}`,
          "Content-Type": "application/json",
        },
        method: "GET",
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
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    // Act & Assert: Expect rejection to be handled
    await expect(trashSender(mockToken, senderEmail)).rejects.toThrow(
      "Network error",
    );
  });
});
