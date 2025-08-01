import { realActions } from "../../../src/_shared/utils/actions/realActions";
const { deleteSenders } = realActions;

// Create mocks for dependent functions
import { trashMultipleSenders } from "../../../src/_shared/utils/trashSenders";
jest.mock("../../../src/_shared/utils/trashSenders", () => ({
  trashMultipleSenders: jest.fn(() => Promise.resolve()),
}));

(global as any).chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
};

describe("deleteSenders", () => {
  const accountEmail = "testuseraccount@example.com";
  const mockGetEmailAccount = jest.fn().mockResolvedValue(accountEmail);

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
        callback({ [accountEmail]: { senders: initialSenders } });
      },
    );

    // Setup chrome.storage.local.set mock
    (chrome.storage.local.set as jest.Mock).mockImplementation(
      (data: any, callback) => {
        callback();
      },
    );

    // Call the function and wait for the promise to resolve
    await deleteSenders(emails, mockGetEmailAccount);

    // We expect trashMultipleSenders to have been called with the emails
    expect(trashMultipleSenders).toHaveBeenCalledWith(emails, accountEmail);

    // After trashing, the local storage should have been updated to remove any senders with emails in the list.
    const expectedSenders = initialSenders.filter(
      (sender) => !emails.includes(sender[0]),
    );
    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      { [accountEmail]: { senders: expectedSenders } },
      expect.any(Function),
    );

    expect(logSpy).toHaveBeenCalledWith("Trashed senders successfully");

    logSpy.mockRestore();
  });
});
