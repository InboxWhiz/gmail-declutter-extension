import {
  getValidToken,
  signInWithGoogle,
  getCachedToken,
  exportForTest,
} from "../../src/_shared/utils/googleAuth";
const {
  buildAuthUrl,
  launchWebAuthFlow,
  fetchUserEmail,
  cacheToken,
  verifyToken,
} = exportForTest;

describe("getValidToken", () => {
  const email = "test@example.com";
  const token = "valid-token";
  const expiredToken = "expired-token";
  const newToken = "new-token";
  const now = Date.now();

  const mockGetCachedToken = jest.fn();
  const mockVerifyToken = jest.fn();
  const mockSignInWithGoogle = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("returns cached token if valid and verified", async () => {
    // Arrange
    mockGetCachedToken.mockResolvedValue({
      token: token,
      expiresAt: now + 10000,
    });
    mockVerifyToken.mockResolvedValue(true);

    // Act & Assert
    await expect(
      getValidToken(email, {
        getCachedToken: mockGetCachedToken,
        verifyToken: mockVerifyToken,
      }),
    ).resolves.toBe(token);
  });

  it("gets new token if cached token is expired", async () => {
    // Arrange
    mockGetCachedToken
      .mockResolvedValueOnce({
        token: expiredToken,
        expiresAt: now - 1000,
      })
      .mockResolvedValueOnce({
        token: newToken,
        expiresAt: now + 3600000,
      });
    mockVerifyToken.mockResolvedValue(true);
    mockSignInWithGoogle.mockResolvedValue({
      token: newToken,
      email: email,
    });

    // Act
    const result = await getValidToken(email, {
      getCachedToken: mockGetCachedToken,
      verifyToken: mockVerifyToken,
      signInWithGoogle: mockSignInWithGoogle,
    });

    // Assert
    expect(result).toBe(newToken);
    expect(mockVerifyToken).not.toHaveBeenCalledWith(expiredToken); // No need to verify when token is expired anyway
    expect(mockSignInWithGoogle).toHaveBeenCalledWith(email); // Calls signInWithGoogle to get new token
  });

  it("gets new token if cached token is invalid", async () => {
    // Arrange
    mockGetCachedToken
      .mockResolvedValueOnce({
        token: token,
        expiresAt: now + 10000,
      })
      .mockResolvedValueOnce({
        token: newToken,
        expiresAt: now + 3600000,
      });
    mockVerifyToken.mockResolvedValue(false);
    mockSignInWithGoogle.mockResolvedValue({
      token: newToken,
      email: email,
    });

    // Act
    const result = await getValidToken(email, {
      getCachedToken: mockGetCachedToken,
      verifyToken: mockVerifyToken,
      signInWithGoogle: mockSignInWithGoogle,
    });

    // Assert
    expect(result).toBe(newToken);
    expect(mockVerifyToken).toHaveBeenCalledTimes(1);
    expect(mockVerifyToken).toHaveBeenCalledWith(token);
    expect(mockSignInWithGoogle).toHaveBeenCalledWith(email); // Calls signInWithGoogle to get new token
  });

  it("gets new token if no cached token", async () => {
    // Arrange
    mockGetCachedToken.mockResolvedValueOnce(null).mockResolvedValueOnce({
      token: newToken,
      expiresAt: now + 3600000,
    });
    mockSignInWithGoogle.mockResolvedValue({
      token: newToken,
      email: email,
    });
    mockVerifyToken.mockResolvedValue(true);

    // Act
    const result = await getValidToken(email, {
      getCachedToken: mockGetCachedToken,
      signInWithGoogle: mockSignInWithGoogle,
    });

    // Assert
    expect(result).toBe(newToken);
    expect(mockGetCachedToken).toHaveBeenCalledWith(email);
    expect(mockSignInWithGoogle).toHaveBeenCalledWith(email); // Calls signInWithGoogle to get new token
  });
});

describe("signInWithGoogle", () => {
  const email = "test@example.com";
  const token = "token123";

  const mockBuildAuthURL = jest.fn();
  const mockLaunchWebAuthFlow = jest.fn();
  const mockFetchUserEmail = jest.fn();
  const mockCacheToken = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockBuildAuthURL.mockReturnValue("auth-url");
    mockLaunchWebAuthFlow.mockResolvedValue(token);
    mockFetchUserEmail.mockResolvedValue(email);
    mockCacheToken.mockResolvedValue(undefined);
  });

  it("returns and stores token and email if email matches", async () => {
    // Act
    const result = await signInWithGoogle(email, {
      buildAuthUrl: mockBuildAuthURL,
      launchWebAuthFlow: mockLaunchWebAuthFlow,
      fetchUserEmail: mockFetchUserEmail,
      cacheToken: mockCacheToken,
    });

    // Assert
    expect(result).toEqual({ token, email });
    expect(mockCacheToken).toHaveBeenCalledWith(email, token);
  });

  it("throws if email does not match", async () => {
    // Arrange
    mockFetchUserEmail.mockResolvedValue("other@example.com");

    // Act & Assert
    await expect(
      signInWithGoogle(email, {
        buildAuthUrl: mockBuildAuthURL,
        launchWebAuthFlow: mockLaunchWebAuthFlow,
        fetchUserEmail: mockFetchUserEmail,
        cacheToken: mockCacheToken,
      }),
    ).rejects.toThrow("Wrong email: other@example.com");
  });
});

describe("buildAuthUrl", () => {
  beforeEach(() => {
    (global as any).chrome = {
      identity: {
        getRedirectURL: jest
          .fn()
          .mockReturnValue("https://redirect.example.com"),
      },
    };
  });

  it("builds a valid Google OAuth2 URL with correct params", () => {
    const email = "user@example.com";
    const url = buildAuthUrl(email);
    expect(url).toContain("https://accounts.google.com/o/oauth2/v2/auth");
    expect(url).toContain(
      "client_id=396720193118-mun9vgnvus9om9tpfj1tbamd2b014kaf.apps.googleusercontent.com",
    );
    expect(url).toContain("redirect_uri=https%3A%2F%2Fredirect.example.com");
    expect(url).toContain("scope=");
    expect(url).toContain("login_hint=user%40example.com");
    expect(url).toContain("prompt=consent");
    expect(url).toContain("response_type=token");
  });
});

describe("launchWebAuthFlow", () => {
  beforeEach(() => {
    (global as any).chrome = {
      identity: {
        launchWebAuthFlow: jest.fn(),
      },
      runtime: {},
    };
  });

  it("resolves with access token from redirect URL", async () => {
    const token = "abc123";
    const redirectUrl = `https://redirect.example.com#access_token=${token}&token_type=Bearer`;
    (chrome.identity.launchWebAuthFlow as jest.Mock).mockImplementation(
      (opts, cb) => cb(redirectUrl),
    );
    await expect(launchWebAuthFlow("http://auth")).resolves.toBe(token);
  });

  it("rejects if chrome.runtime.lastError is set", async () => {
    chrome.runtime.lastError = { message: "Auth error" };
    (chrome.identity.launchWebAuthFlow as jest.Mock).mockImplementation(
      (opts, cb) => cb(null),
    );
    await expect(launchWebAuthFlow("http://auth")).rejects.toThrow(
      "Auth error",
    );
    chrome.runtime.lastError = undefined;
  });

  it("rejects if access token is not found in redirect URL", async () => {
    (chrome.identity.launchWebAuthFlow as jest.Mock).mockImplementation(
      (opts, cb) => cb("https://redirect.example.com#notoken=1"),
    );
    await expect(launchWebAuthFlow("http://auth")).rejects.toThrow(
      "Access token not found in redirect URL.",
    );
  });

  it("rejects if redirectUrl is null", async () => {
    (chrome.identity.launchWebAuthFlow as jest.Mock).mockImplementation(
      (opts, cb) => cb(null),
    );
    await expect(launchWebAuthFlow("http://auth")).rejects.toThrow(
      "Authorization failed.",
    );
  });
});

describe("fetchUserEmail", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("returns email from API response", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ email: "foo@bar.com" }),
    });
    await expect(fetchUserEmail("token")).resolves.toBe("foo@bar.com");
  });

  it("throws if response is not ok", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });
    await expect(fetchUserEmail("token")).rejects.toThrow(
      "Failed to fetch user info",
    );
  });
});

describe("cacheToken and getCachedToken", () => {
  beforeEach(() => {
    (global as any).chrome = {
      storage: {
        local: {
          get: jest.fn(),
          set: jest.fn(),
        },
      },
    };
  });

  it("caches token with correct structure", async () => {
    // Arrange
    (chrome.storage.local.get as jest.Mock).mockResolvedValue({
      googleAuth: { "a@b.com": { token: "old", expiresAt: 1 } },
    });

    // Act
    await cacheToken("a@b.com", "newtoken");

    // Assert
    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({
        googleAuth: expect.objectContaining({
          "a@b.com": expect.objectContaining({
            token: "newtoken",
            expiresAt: expect.any(Number),
          }),
        }),
      }),
    );
  });

  it("does not disrupt tokens for other emails when caching a new token", async () => {
    // Arrange
    (chrome.storage.local.get as jest.Mock).mockResolvedValue({
      googleAuth: {
        "a@b.com": { token: "oldA", expiresAt: 1 },
        "c@d.com": { token: "oldC", expiresAt: 2 },
      },
    });

    // Act
    await cacheToken("a@b.com", "newA");

    // Assert
    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({
        googleAuth: expect.objectContaining({
          "a@b.com": expect.objectContaining({
            token: "newA",
            expiresAt: expect.any(Number),
          }),
          "c@d.com": expect.objectContaining({
            token: "oldC",
            expiresAt: 2,
          }),
        }),
      }),
    );
  });

  it("returns cached token if present", async () => {
    const now = Date.now();
    (chrome.storage.local.get as jest.Mock).mockResolvedValue({
      googleAuth: { "a@b.com": { token: "tok", expiresAt: now + 1000 } },
    });
    await expect(getCachedToken("a@b.com")).resolves.toEqual({
      token: "tok",
      expiresAt: now + 1000,
    });
  });

  it("returns null if no token for email", async () => {
    (chrome.storage.local.get as jest.Mock).mockResolvedValue({
      googleAuth: {},
    });
    await expect(getCachedToken("missing@b.com")).resolves.toBeNull();
  });

  it("returns null if googleAuth is missing", async () => {
    (chrome.storage.local.get as jest.Mock).mockResolvedValue({});
    await expect(getCachedToken("missing@b.com")).resolves.toBeNull();
  });

  it("returns null if token or expiresAt missing", async () => {
    (chrome.storage.local.get as jest.Mock).mockResolvedValue({
      googleAuth: { "a@b.com": { token: null, expiresAt: null } },
    });
    await expect(getCachedToken("a@b.com")).resolves.toBeNull();
  });
});

describe("verifyToken", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("returns true if status is 200", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ status: 200 });
    await expect(verifyToken("token")).resolves.toBe(true);
  });

  it("returns false if status is not 200", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ status: 401 });
    await expect(verifyToken("token")).resolves.toBe(false);
  });

  it("returns false if fetch throws", async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("fail"));
    await expect(verifyToken("token")).resolves.toBe(false);
  });
});
