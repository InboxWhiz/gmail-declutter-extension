import { getOAuthToken } from "../extension/background/auth.js";

describe("getOAuthToken", () => {
  beforeEach(() => {
    //eslint-disable-next-line no-undef
    global.chrome = {
      identity: {
        getAuthToken: jest.fn(),
      },
      runtime: {},
    };
  });

  test("resolves token when chrome.identity.getAuthToken succeeds", async () => {
    chrome.identity.getAuthToken.mockImplementation((options, callback) => {
      callback("mock-token");
    });

    const token = await getOAuthToken();
    expect(token).toBe("mock-token");
  });

  test("rejects when chrome.runtime.lastError exists", async () => {
    chrome.identity.getAuthToken.mockImplementation((options, callback) => {
      chrome.runtime.lastError = { message: "Permission denied" };
      callback(null);
    });

    await expect(getOAuthToken()).rejects.toEqual({
      message: "Permission denied",
    });
  });

  test("rejects when no token is returned (null)", async () => {
    chrome.identity.getAuthToken.mockImplementation((options, callback) => {
      callback(null);
    });

    await expect(getOAuthToken()).rejects.toEqual({
      message: "No OAuth token received.",
    });
  });

  test("passes correct interactive value to getAuthToken", async () => {
    chrome.identity.getAuthToken.mockImplementation((options, callback) => {
      expect(options).toEqual({ interactive: false });
      callback("mock-token");
    });

    const token = await getOAuthToken(false);
    expect(token).toBe("mock-token");
  });
});
