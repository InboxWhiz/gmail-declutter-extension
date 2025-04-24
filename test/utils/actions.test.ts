import { realActions } from "../../src/utils/actions/realActions";
const actions = realActions;

const {
  searchEmailSenders,
  deleteSenders,
  getAllSenders,
  unsubscribeSendersAuto,
} = actions;

import { Sender } from "../../src/types/types";

import { trashMultipleSenders } from "../../src/utils/trashSenders";
import { fetchAllSenders } from "../../src/utils/fetchSenders";
import {
  getMultipleUnsubscribeData,
  unsubscribeUsingPostUrl,
  unsubscribeUsingMailTo,
} from "../../src/utils/unsubscribeSenders";

// Create mocks for dependent functions
jest.mock("../../src/utils/trashSenders", () => ({
  trashMultipleSenders: jest.fn(() => Promise.resolve()),
}));
jest.mock("../../src/utils/fetchSenders", () => ({
  fetchAllSenders: jest.fn(() => Promise.resolve()),
}));
jest.mock("../../src/utils/unsubscribeSenders", () => ({
  getMultipleUnsubscribeData: jest.fn(),
  unsubscribeUsingPostUrl: jest.fn(),
  unsubscribeUsingMailTo: jest.fn(),
}));

beforeEach(() => {
  // Reset mocks between tests
  jest.clearAllMocks();

  // Create global chrome object with stub implementations
  (global as any).chrome = {
    tabs: {
      query: jest.fn(),
      sendMessage: jest.fn(),
    },
    storage: {
      local: {
        get: jest.fn(),
        set: jest.fn(),
      },
    },
    runtime: {
      lastError: null,
    },
  };
});

describe("searchEmailSenders", () => {
  test("should log the search and send a message to the active tab if found", () => {
    // Arrange
    const emails = ["test1@example.com", "test2@example.com"];
    (chrome.tabs.query as jest.Mock).mockImplementation(
      (queryObj: any, callback: (tabs: any[]) => void) => {
        callback([{ id: 123 }]);
      }
    );

    // Act
    searchEmailSenders(emails);

    // Assert
    expect(chrome.tabs.query).toHaveBeenCalledWith(
      { active: true, currentWindow: true },
      expect.any(Function)
    );
    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(123, {
      type: "SEARCH_EMAIL_SENDERS",
      emails: emails,
    });
  });
});

describe("deleteSenders", () => {
  test("should trash senders and update local storage", async () => {
    const emails = ["test@example.com", "user@example.com"];
    // Spy on console.log to check outputs
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    // Setup chrome.storage.local.get:
    const initialSenders: [string, string, number][] = [
      ["test@example.com", "Test", 5],
      ["user@example.com", "User", 3],
      ["other@example.com", "Other", 1],
    ];

    // The get callback returns the initialSenders
    (chrome.storage.local.get as jest.Mock).mockImplementation(
      (keys: string[], callback: (result: { [key: string]: any }) => void) => {
        callback({ senders: initialSenders });
      }
    );

    // Setup chrome.storage.local.set mock
    (chrome.storage.local.set as jest.Mock).mockImplementation(
      (data: any, callback) => {
        callback();
      }
    );

    // Call the function and wait for the promise to resolve
    await deleteSenders(emails);

    // We expect trashMultipleSenders to have been called with the emails
    expect(trashMultipleSenders).toHaveBeenCalledWith(emails);

    // After trashing, the local storage should have been updated to remove any senders with emails in the list.
    const expectedSenders = initialSenders.filter(
      (sender) => !emails.includes(sender[0])
    );
    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      { senders: expectedSenders },
      expect.any(Function)
    );

    expect(logSpy).toHaveBeenCalledWith("Trashed senders successfully");

    logSpy.mockRestore();
  });
});

describe("getAllSenders", () => {
  test("returns senders from local storage if available", async () => {
    const storedSenders: [string, string, number][] = [
      ["sender1@example.com", "Sender 1", 10],
      ["sender2@example.com", "Sender 2", 5],
    ];
    (chrome.storage.local.get as jest.Mock).mockImplementation(
      (keys: string[], callback: (result: { [key: string]: any }) => void) => {
        callback({ senders: storedSenders });
      }
    );

    const result = await getAllSenders();
    const expected: Sender[] = storedSenders.map((sender) => ({
      email: sender[0],
      name: sender[1],
      count: sender[2],
    }));

    expect(result).toEqual(expected);
    // Ensure fetchAllSenders is not called when fetchNew is false
    expect(fetchAllSenders).not.toHaveBeenCalled();
  });

  test("calls fetchAllSenders if fetchNew is true", async () => {
    const storedSenders: [string, string, number][] = [
      ["sender3@example.com", "Sender 3", 7],
    ];
    (chrome.storage.local.get as jest.Mock).mockImplementation(
      (keys: string[], callback: (result: { [key: string]: any }) => void) => {
        callback({ senders: storedSenders });
      }
    );

    // Call with fetchNew true. This should await fetchAllSenders.
    const result = await getAllSenders(true);
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
    (chrome.storage.local.get as jest.Mock).mockImplementation(
      (keys: string[], callback: (result: { [key: string]: any }) => void) => {
        callback({});
      }
    );

    // Because of recursion in getAllSenders implementation, we need to break the cycle.
    // One way is to simulate that after calling fetchAllSenders, storage still has no senders.
    // Here, we simply call getAllSenders with fetchNew true.
    const result = await getAllSenders(true);
    expect(result).toEqual([]);
  });

  test("rejects if chrome.runtime.lastError is present", async () => {
    // Simulate chrome.runtime.lastError inside chrome.storage.local.get.
    (chrome.storage.local.get as jest.Mock).mockImplementation(
      (keys: string[], callback: (result: { [key: string]: any }) => void) => {
        chrome.runtime.lastError = "Some error" as chrome.runtime.LastError;
        callback({ senders: [] });
      }
    );

    await expect(getAllSenders()).rejects.toEqual("Some error");
    // Reset lastError for further tests.
    chrome.runtime.lastError = null as unknown as chrome.runtime.LastError;
  });
});

describe("unsubscribeSendersAuto", () => {
  const mockSenders = [
    ["sender1@example.com", "Sender 1", 10, "message-id-1"],
    ["sender2@example.com", "Sender 2", 5, "message-id-2"],
    ["sender3@example.com", "Sender 3", 25, "message-id-3"],
    ["sender4@example.com", "Sender 4", 14, "message-id-4"],
  ];

  const mockUnsubscribeData = [
    {
      posturl: "http://unsubscribe-url.com/post",
      mailto: null,
      clickurl: null,
    },
    { posturl: null, mailto: "mailto:unsubscribe@sender.com", clickurl: null },
    {
      posturl: null,
      mailto: null,
      clickurl: "http://unsubscribe-url.com/click",
    },
    { posturl: null, mailto: null, clickurl: null },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call getMultipleUnsubscribeData with correct message ids", async () => {
    // Arrange
    const emails = [
      "sender1@example.com",
      "sender2@example.com",
      "sender3@example.com",
      "sender4@example.com",
    ];
    (chrome.storage.local.get as jest.Mock).mockResolvedValue({ senders: mockSenders });
    (getMultipleUnsubscribeData as jest.Mock).mockResolvedValue(
      mockUnsubscribeData
    );

    // Act
    await unsubscribeSendersAuto(emails);

    // Assert
    expect(getMultipleUnsubscribeData).toHaveBeenCalledTimes(1);
    expect(getMultipleUnsubscribeData).toHaveBeenCalledWith([
      "message-id-1",
      "message-id-2",
      "message-id-3",
      "message-id-4",
    ]);
  });

  it("should call unsubscribeUsingMailTo when mailto is present", async () => {
    // Arrange
    const emails = ["sender2@example.com"];
    (chrome.storage.local.get as jest.Mock).mockResolvedValue({ senders: [mockSenders[1]] });
    (getMultipleUnsubscribeData as jest.Mock).mockResolvedValue([
      mockUnsubscribeData[1],
    ]);

    // Act
    await unsubscribeSendersAuto(emails);

    // Assert
    expect(unsubscribeUsingPostUrl).not.toHaveBeenCalled();
    expect(unsubscribeUsingMailTo).toHaveBeenCalledWith(
      "mailto:unsubscribe@sender.com"
    );
  });

  it("should not call unsubscribeUsingPostUrl or unsubscribeUsingMailTo if no auto-unsubscribe method is available", async () => {
    // Arrange
    const emails = ["sender3@example.com"];
    (chrome.storage.local.get as jest.Mock).mockResolvedValue({ senders: [mockSenders[2]] });
    (getMultipleUnsubscribeData as jest.Mock).mockResolvedValue([
      mockUnsubscribeData[2],
    ]);

    // Act
    await unsubscribeSendersAuto(emails);

    // Assert: Neither method should be called
    expect(unsubscribeUsingPostUrl).not.toHaveBeenCalled();
    expect(unsubscribeUsingMailTo).not.toHaveBeenCalled();
  });
});
