import { realActions } from "../../../src/sidebar/utils/actions/realActions";
const { searchEmailSenders } = realActions;

// Create global chrome object with stub implementations
(global as any).chrome = {
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn(),
  },
};

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
