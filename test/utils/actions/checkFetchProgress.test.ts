import { realActions } from "../../../src/sidebar/utils/actions/realActions";
const { checkFetchProgress } = realActions;

(global as any).chrome = {
  storage: {
    local: {
      get: jest.fn(),
    },
  },
};

describe("checkFetchProgress", () => {
  test("calls setProgressCallback with fetchProgress from storage", async () => {
    // Arrange
    const mockSetProgress = jest.fn();
    (chrome.storage.local.get as jest.Mock).mockImplementation(
      (key: string, callback: (data: { fetchProgress: number }) => void) => {
        callback({ fetchProgress: 0.75 });
      },
    );

    // Act
    const result = await checkFetchProgress(mockSetProgress);

    // Assert
    expect(chrome.storage.local.get).toHaveBeenCalledWith(
      "fetchProgress",
      expect.any(Function),
    );
    expect(mockSetProgress).toHaveBeenCalledWith(0.75);
    expect(result).toBe(0.75);
  });

  test("calls setProgressCallback with 0 if fetchProgress is undefined", async () => {
    // Arrange
    const mockSetProgress = jest.fn();
    (chrome.storage.local.get as jest.Mock).mockImplementation(
      (key: string, callback: (data: object) => void) => {
        callback({});
      },
    );

    // Act
    const result = await checkFetchProgress(mockSetProgress);

    // Assert
    expect(mockSetProgress).toHaveBeenCalledWith(0);
    expect(result).toBe(0);
  });
});
