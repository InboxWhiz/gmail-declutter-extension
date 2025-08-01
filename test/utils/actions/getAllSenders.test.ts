import { realActions } from "../../../src/_shared/utils/actions/realActions";
const { getAllSenders } = realActions;
import { Sender } from "../../../src/_shared/types/types";

// Create mocks for dependent functions
import { fetchAllSenders } from "../../../src/_shared/utils/fetchSenders";
jest.mock("../../../src/_shared/utils/fetchSenders", () => ({
  fetchAllSenders: jest.fn(() => Promise.resolve()),
}));

(global as any).chrome = {
  storage: {
    local: {
      get: jest.fn(),
    },
  },
  runtime: {
    lastError: null,
  },
};

describe("getAllSenders", () => {
  const accountEmail = "test@example.com";
  const mockGetEmailAccount = jest.fn().mockResolvedValue(accountEmail);

  test("returns senders from local storage if available", async () => {
    // Arrange
    const storedSenders: [string, string, number][] = [
      ["sender1@example.com", "Sender 1", 10],
      ["sender2@example.com", "Sender 2", 5],
    ];
    (chrome.storage.local.get as jest.Mock).mockResolvedValue({
      [accountEmail]: { senders: storedSenders },
    });

    // Act
    const result = await getAllSenders(false, mockGetEmailAccount);
    const expected: Sender[] = storedSenders.map((sender) => ({
      email: sender[0],
      name: sender[1],
      count: sender[2],
    }));

    // Assert
    expect(result).toEqual(expected);
    expect(fetchAllSenders).not.toHaveBeenCalled(); // Ensure fetchAllSenders is not called when fetchNew is false
  });

  test("calls fetchAllSenders if fetchNew is true", async () => {
    const storedSenders: [string, string, number][] = [
      ["sender3@example.com", "Sender 3", 7],
    ];
    (chrome.storage.local.get as jest.Mock).mockResolvedValue({
      [accountEmail]: { senders: storedSenders },
    });

    // Call with fetchNew true. This should await fetchAllSenders.
    const result = await getAllSenders(true, mockGetEmailAccount);
    const expected: Sender[] = storedSenders.map((sender) => ({
      email: sender[0],
      name: sender[1],
      count: sender[2],
    }));

    expect(fetchAllSenders).toHaveBeenCalled();
    expect(result).toEqual(expected);
  });

  test("returns empty array if no senders are found, even after fetching", async () => {
    // First call returns no senders
    (chrome.storage.local.get as jest.Mock).mockResolvedValue({
      [accountEmail]: { senders: [] },
    });

    // Because of recursion in getAllSenders implementation, we need to break the cycle.
    // One way is to simulate that after calling fetchAllSenders, storage still has no senders.
    // Here, we simply call getAllSenders with fetchNew true.
    const result = await getAllSenders(true, mockGetEmailAccount);
    expect(result).toEqual([]);
  });

  test("calls fetchAllSenders if senders key is not found in storage", async () => {
    // Simulate that the senders key is not found in local storage on first call,
    // and after fetchAllSenders is called, senders are available.
    let callCount = 0;
    (chrome.storage.local.get as jest.Mock).mockImplementation(
      (keys: string[], callback?: (result: { [key: string]: any }) => void) => {
        callCount++;
        const result =
          callCount === 1
            ? {}
            : {
                [accountEmail]: {
                  senders: [["sender4@example.com", "Sender 4", 7]],
                },
              };
        if (callback && typeof callback === "function") {
          callback(result);
        } else {
          return Promise.resolve(result);
        }
      },
    );

    await getAllSenders(false, mockGetEmailAccount);

    // Check if fetchAllSenders was called
    expect(fetchAllSenders).toHaveBeenCalled();
  });

  test("rejects if chrome.runtime.lastError is present", async () => {
    // Simulate chrome.runtime.lastError inside chrome.storage.local.get.
    (chrome.storage.local.get as jest.Mock).mockImplementation(
      (keys: string[], callback: (result: { [key: string]: any }) => void) => {
        chrome.runtime.lastError = "Some error" as chrome.runtime.LastError;
        callback({ senders: [] });
      },
    );

    await expect(
      getAllSenders(false, mockGetEmailAccount),
    ).rejects.toBeDefined();
    // Reset lastError for further tests.
    chrome.runtime.lastError = null as unknown as chrome.runtime.LastError;
  });

  test("filters out @gmail.com senders from the result", async () => {
    // Arrange
    const storedSenders: [string, string, number][] = [
      ["user1@gmail.com", "User 1", 2],
      ["user2@gmail.com", "User 2", 3],
      ["external@example.com", "External", 5],
      ["another@domain.com", "Another", 1],
    ];
    (chrome.storage.local.get as jest.Mock).mockResolvedValue({
      [accountEmail]: { senders: storedSenders },
    });

    // Act
    const result = await getAllSenders(false, mockGetEmailAccount);

    // Assert
    const expected: Sender[] = [
      { email: "external@example.com", name: "External", count: 5 },
      { email: "another@domain.com", name: "Another", count: 1 },
    ];
    expect(result).toEqual(expected);
  });

  test("filters out Unknown Sender from the result", async () => {
    // Arrange
    const storedSenders: [string, string, number][] = [
      ["user1@email.com", "User 1", 2],
      ["null", "Unknown Sender", 5],
      ["user2@email.com", "User 2", 3],
    ];
    (chrome.storage.local.get as jest.Mock).mockResolvedValue({
      [accountEmail]: { senders: storedSenders },
    });

    // Act
    const result = await getAllSenders(false, mockGetEmailAccount);

    // Assert
    const expected: Sender[] = [
      { email: "user1@email.com", name: "User 1", count: 2 },
      { email: "user2@email.com", name: "User 2", count: 3 },
    ];
    expect(result).toEqual(expected);
  });
});
