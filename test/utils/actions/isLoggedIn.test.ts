import { realActions } from "../../../src/sidebar/utils/actions/realActions";
import * as authModule from "../../../src/_shared/utils/auth";

// Create a clone of realActions so we can mock getEmailAccount
const testActions = {
  ...realActions,
  getEmailAccount: jest.fn(),
};

jest.mock("../../../src/_shared/utils/auth");
const mockGetOAuthToken = authModule.getOAuthToken as jest.Mock;
const mockGetAuthenticatedEmail = authModule.getAuthenticatedEmail as jest.Mock;

describe("isLoggedIn", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("returns false when getOAuthToken throws", async () => {
    mockGetOAuthToken.mockRejectedValueOnce(new Error("Token fetch failed"));

    const result = await testActions.isLoggedIn.call(testActions);
    expect(result).toBe(false);
    expect(mockGetOAuthToken).toHaveBeenCalledWith(false);
  });

  it("returns false when authenticated email does not match Gmail email", async () => {
    mockGetOAuthToken.mockResolvedValueOnce("mock_token");
    mockGetAuthenticatedEmail.mockResolvedValueOnce("auth@example.com");
    (testActions.getEmailAccount as jest.Mock).mockResolvedValueOnce("gmail@example.com");

    const result = await testActions.isLoggedIn.call(testActions);
    expect(result).toBe(false);
  });

  it("returns true when authenticated email matches Gmail email", async () => {
    mockGetOAuthToken.mockResolvedValueOnce("mock_token");
    mockGetAuthenticatedEmail.mockResolvedValueOnce("user@example.com");
    (testActions.getEmailAccount as jest.Mock).mockResolvedValueOnce("user@example.com");

    const result = await testActions.isLoggedIn.call(testActions);
    expect(result).toBe(true);
  });

  it("throws if getEmailAccount fails", async () => {
    mockGetOAuthToken.mockResolvedValueOnce("mock_token");
    mockGetAuthenticatedEmail.mockResolvedValueOnce("user@example.com");
    (testActions.getEmailAccount as jest.Mock).mockRejectedValueOnce(new Error("No active tab"));

    await expect(testActions.isLoggedIn.call(testActions)).rejects.toThrow("No active tab");
  });

  it("throws if getAuthenticatedEmail fails", async () => {
    mockGetOAuthToken.mockResolvedValueOnce("mock_token");
    mockGetAuthenticatedEmail.mockRejectedValueOnce(new Error("Auth error"));

    await expect(testActions.isLoggedIn.call(testActions)).rejects.toThrow("Auth error");
  });
});
