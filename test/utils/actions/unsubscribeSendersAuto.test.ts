import { realActions } from "../../../src/sidebar/utils/actions/realActions";
const { unsubscribeSendersAuto } = realActions;

// Create mocks for dependent functions
import {
  getMultipleUnsubscribeData,
  unsubscribeUsingPostUrl,
  unsubscribeUsingMailTo,
} from "../../../src/sidebar/utils/unsubscribeSenders";
jest.mock("../../../src/sidebar/utils/unsubscribeSenders", () => ({
  getMultipleUnsubscribeData: jest.fn(),
  unsubscribeUsingPostUrl: jest.fn(),
  unsubscribeUsingMailTo: jest.fn(),
}));

(global as any).chrome = {
  storage: {
    local: {
      get: jest.fn(),
    },
  },
};

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
    (chrome.storage.local.get as jest.Mock).mockResolvedValue({
      senders: mockSenders,
    });
    (getMultipleUnsubscribeData as jest.Mock).mockResolvedValue(
      mockUnsubscribeData,
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
    (chrome.storage.local.get as jest.Mock).mockResolvedValue({
      senders: [mockSenders[1]],
    });
    (getMultipleUnsubscribeData as jest.Mock).mockResolvedValue([
      mockUnsubscribeData[1],
    ]);

    // Act
    await unsubscribeSendersAuto(emails);

    // Assert
    expect(unsubscribeUsingPostUrl).not.toHaveBeenCalled();
    expect(unsubscribeUsingMailTo).toHaveBeenCalledWith(
      "mailto:unsubscribe@sender.com",
    );
  });

  it("should not call unsubscribeUsingPostUrl or unsubscribeUsingMailTo if no auto-unsubscribe method is available", async () => {
    // Arrange
    const emails = ["sender3@example.com"];
    (chrome.storage.local.get as jest.Mock).mockResolvedValue({
      senders: [mockSenders[2]],
    });
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
