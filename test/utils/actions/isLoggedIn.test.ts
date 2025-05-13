import { realActions } from "../../../src/sidebar/utils/actions/realActions";
const { isLoggedIn } = realActions;
import * as authModule from "../../../src/_shared/utils/auth";

jest.mock("../../../src/_shared/utils/auth");
const mockGetOAuthToken = authModule.getOAuthToken as jest.Mock;
const mockGetAuthenticatedEmail = authModule.getAuthenticatedEmail as jest.Mock;
const mockGetEmailAccount = jest.fn();

describe("isLoggedIn", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("calls getOAuthToken, getAuthenticatedEmail, and getEmailAccount", async () => {
    mockGetOAuthToken.mockResolvedValueOnce("mock_token");
    mockGetAuthenticatedEmail.mockResolvedValueOnce("user@example.com");
    mockGetEmailAccount.mockResolvedValueOnce("user@example.com");

    await isLoggedIn(mockGetEmailAccount);

    expect(mockGetOAuthToken).toHaveBeenCalledWith(false);
    expect(mockGetAuthenticatedEmail).toHaveBeenCalled();
    expect(mockGetEmailAccount).toHaveBeenCalled();
  });

  it("returns false when getOAuthToken throws", async () => {
    mockGetOAuthToken.mockRejectedValueOnce(new Error("Token fetch failed"));

    const result = await isLoggedIn();
    expect(result).toBe(false);
    expect(mockGetOAuthToken).toHaveBeenCalledWith(false);
  });

  it("returns false when authenticated email does not match Gmail email", async () => {
    mockGetOAuthToken.mockResolvedValueOnce("mock_token");
    mockGetAuthenticatedEmail.mockResolvedValueOnce("auth@example.com");
    mockGetEmailAccount.mockResolvedValueOnce("gmail@example.com");

    const result = await isLoggedIn(mockGetEmailAccount);
    expect(result).toBe(false);
  });

  it("returns true when authenticated email matches Gmail email", async () => {
    mockGetOAuthToken.mockResolvedValueOnce("mock_token");
    mockGetAuthenticatedEmail.mockResolvedValueOnce("user@example.com");
    mockGetEmailAccount.mockResolvedValueOnce("user@example.com");

    const result = await isLoggedIn(mockGetEmailAccount);
    expect(result).toBe(true);
  });

  it("throws if getEmailAccount fails", async () => {
    mockGetOAuthToken.mockResolvedValueOnce("mock_token");
    mockGetAuthenticatedEmail.mockResolvedValueOnce("user@example.com");
    mockGetEmailAccount.mockRejectedValueOnce(new Error("No active tab"));

    await expect(isLoggedIn(mockGetEmailAccount)).rejects.toThrow(
      "No active tab",
    );
  });

  it("throws if getAuthenticatedEmail fails", async () => {
    mockGetOAuthToken.mockResolvedValueOnce("mock_token");
    mockGetAuthenticatedEmail.mockRejectedValueOnce(new Error("Auth error"));

    await expect(isLoggedIn()).rejects.toThrow("Auth error");
  });
});
