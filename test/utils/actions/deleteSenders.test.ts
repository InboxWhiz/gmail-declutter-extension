import { realActions } from "../../../src/sidebar/utils/actions/realActions";
const { deleteSenders } = realActions;

// Create mocks for dependent functions
import { trashMultipleSenders } from "../../../src/sidebar/utils/trashSenders";
jest.mock("../../../src/sidebar/utils/trashSenders", () => ({
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
        callback({ "testemail@test.com": { senders: initialSenders } });
      }
    );

    // Setup chrome.storage.local.set mock
    (chrome.storage.local.set as jest.Mock).mockImplementation(
      (data: any, callback) => {
        callback();
      }
    );

    // Call the function and wait for the promise to resolve
    await deleteSenders(emails, "testemail@test.com");

    // We expect trashMultipleSenders to have been called with the emails
    expect(trashMultipleSenders).toHaveBeenCalledWith(emails);

    // After trashing, the local storage should have been updated to remove any senders with emails in the list.
    const expectedSenders = initialSenders.filter(
      (sender) => !emails.includes(sender[0])
    );
    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      { "testemail@test.com": { senders: expectedSenders } },
      expect.any(Function)
    );

    expect(logSpy).toHaveBeenCalledWith("Trashed senders successfully");

    logSpy.mockRestore();
  });
});
