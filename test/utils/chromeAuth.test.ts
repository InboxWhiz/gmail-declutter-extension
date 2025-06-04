import {
  getValidToken,
  exportForTest,
} from "../../src/_shared/utils/chromeAuth";
const { verifyToken } = exportForTest;

describe("getValidToken", () => {
  const accountEmail = "testuser@example.com";
  const mockToken = "token" as chrome.identity.GetAuthTokenResult;
  const mockVerifyToken = jest.fn();

  (global as any).chrome = {
    identity: {
      getAuthToken: jest.fn(),
    },
    runtime: {
      lastError: undefined,
    },
  };

  afterEach(() => {
    jest.resetAllMocks();
    (global as any).chrome.runtime.lastError = undefined;
  });

  it("resolves with token if getAuthToken returns token and verifyToken passes", async () => {
    // Arrange
    (chrome.identity.getAuthToken as jest.Mock).mockImplementation(
      (_details, callback) => {
        callback(mockToken);
      },
    );
    mockVerifyToken.mockResolvedValue(undefined);

    // Act & Assert
    await expect(
      getValidToken(accountEmail, false, { verifyToken: mockVerifyToken }),
    ).resolves.toBe(mockToken);
  });

  it("rejects if getAuthToken returns no token", async () => {
    // Arrange
    (chrome.identity.getAuthToken as jest.Mock).mockImplementation(
      (_details, callback) => {
        callback(undefined);
      },
    );

    // Act & Assert
    await expect(
      getValidToken(accountEmail, false, { verifyToken: mockVerifyToken }),
    ).rejects.toThrow(/No OAuth token received/);
  });

  it("rejects if getAuthToken sets chrome.runtime.lastError", async () => {
    // Arrange
    (chrome.identity.getAuthToken as jest.Mock).mockImplementation(
      (_details, callback) => {
        callback(undefined);
      },
    );
    chrome.runtime.lastError = new Error("auth error");

    // Act & Assert
    await expect(
      getValidToken(accountEmail, false, { verifyToken: mockVerifyToken }),
    ).rejects.toThrow(/auth error/);
  });

  it("rejects if verifyToken fails", async () => {
    // Arrange
    (chrome.identity.getAuthToken as jest.Mock).mockImplementation(
      (_details, callback) => {
        callback(mockToken);
      },
    );
    mockVerifyToken.mockRejectedValue(
      new Error(`Authenticated user email does not match expected email.`),
    );

    // Act & Assert
    await expect(
      getValidToken(accountEmail, false, { verifyToken: mockVerifyToken }),
    ).rejects.toThrow(/does not match expected email/);
  });
});

describe("verifyToken", () => {
  const accountEmail = "testuser@example.com";
  const mockToken = "token" as chrome.identity.GetAuthTokenResult;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("resolves if status is 200 and email matches", async () => {
    // Arrange
    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => ({ email: accountEmail }),
    });

    // Act & Assert
    await expect(verifyToken(mockToken, accountEmail)).resolves.toBeUndefined();
  });

  it("rejects if status is 200 but email does not match", async () => {
    // Arrange
    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => ({ email: "wrong@example.com" }),
    });

    // Act & Assert
    await expect(verifyToken(mockToken, accountEmail)).rejects.toThrow(
      /does not match expected email/,
    );
  });

  it("rejects if status is not 200", async () => {
    // Arrange
    (fetch as jest.Mock).mockResolvedValueOnce({ status: 401 });

    // Act & Assert
    await expect(verifyToken(mockToken, accountEmail)).rejects.toThrow(
      /Token verification failed with status 401/,
    );
  });

  it("rejects if fetch throws an error", async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("network error"));
    await expect(verifyToken(mockToken, accountEmail)).rejects.toThrow(
      /network error/,
    );
  });
});
