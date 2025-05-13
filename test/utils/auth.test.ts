import {
  getOAuthToken,
  getAuthenticatedEmail,
} from "../../src/_shared/utils/auth";

describe("getOAuthToken", () => {
  beforeEach(() => {
    (global as any).chrome = {
      identity: {
        getAuthToken: jest.fn(),
      },
      runtime: {},
    };
  });

  test("resolves token when chrome.identity.getAuthToken succeeds", async () => {
    (chrome.identity.getAuthToken as jest.Mock).mockImplementation(
      (options, callback) => {
        callback("mock-token");
      },
    );

    const token = await getOAuthToken();
    expect(token).toBe("mock-token");
  });

  test("rejects when chrome.runtime.lastError exists", async () => {
    (chrome.identity.getAuthToken as jest.Mock).mockImplementation(
      (options, callback) => {
        chrome.runtime.lastError = { message: "Permission denied" };
        callback(null);
      },
    );

    await expect(getOAuthToken()).rejects.toEqual({
      message: "Permission denied",
    });
  });

  test("rejects when no token is returned (null)", async () => {
    (chrome.identity.getAuthToken as jest.Mock).mockImplementation(
      (options, callback) => {
        callback(null);
      },
    );

    await expect(getOAuthToken()).rejects.toEqual({
      message: "No OAuth token received.",
    });
  });

  test("passes correct interactive value to getAuthToken", async () => {
    (chrome.identity.getAuthToken as jest.Mock).mockImplementation(
      (options, callback) => {
        expect(options).toEqual({ interactive: false });
        callback("mock-token");
      },
    );

    const token = await getOAuthToken(false);
    expect(token).toBe("mock-token");
  });
});

describe("getAuthenticatedEmail", () => {
  const mockToken = "mock-token" as chrome.identity.GetAuthTokenResult;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("resolves with email when response is valid", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        emailAddress: "user@example.com",
      }),
    });

    const email = await getAuthenticatedEmail(mockToken);
    expect(email).toBe("user@example.com");
  });

  it("rejects when email is missing from response", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await expect(getAuthenticatedEmail(mockToken)).rejects.toThrow(
      "Email address not found in response",
    );
  });

  it("rejects on non-ok response (e.g., 400)", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({}),
    });

    await expect(getAuthenticatedEmail(mockToken)).rejects.toThrow(
      "Failed to fetch user info",
    );
  });
});
