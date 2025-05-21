import { realActions } from "../../../src/_shared/utils/actions/realActions";
const { checkFetchProgress } = realActions;

(global as any).chrome = {
  storage: {
    local: {
      get: jest.fn(),
    },
  },
};

describe("checkFetchProgress", () => {
  const accountEmail = "test@example.com";
  const mockSetProgress = jest.fn();
  const mockGetEmailAccount = jest.fn().mockResolvedValue(accountEmail);

  test("calls setProgressCallback with fetchProgress from storage", async () => {
    // Arrange
    (chrome.storage.local.get as jest.Mock).mockResolvedValue({
      fetchProgress: { [accountEmail]: 0.75 },
    });

    // Act
    const result = await checkFetchProgress(
      mockSetProgress,
      mockGetEmailAccount,
    );

    // Assert
    expect(chrome.storage.local.get).toHaveBeenCalledWith("fetchProgress");
    expect(mockSetProgress).toHaveBeenCalledWith(0.75);
    expect(result).toBe(0.75);
  });

  test("calls setProgressCallback with 0 if fetchProgress is undefined", async () => {
    // Arrange
    (chrome.storage.local.get as jest.Mock).mockResolvedValue({});

    // Act
    const result = await checkFetchProgress(
      mockSetProgress,
      mockGetEmailAccount,
    );

    // Assert
    expect(mockSetProgress).toHaveBeenCalledWith(0);
    expect(result).toBe(0);
  });

  test("calls setProgressCallback with 0 if fetchProgress does not have a record for this account", async () => {
    // Arrange
    (chrome.storage.local.get as jest.Mock).mockResolvedValue({
      fetchProgress: { "otheraccount@example.com": 0.75 },
    });

    // Act
    const result = await checkFetchProgress(
      mockSetProgress,
      mockGetEmailAccount,
    );

    // Assert
    expect(mockSetProgress).toHaveBeenCalledWith(0);
    expect(result).toBe(0);
  });
});
