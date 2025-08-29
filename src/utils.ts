/**
 * Returns the appropriate asset URL depending on the environment.
 *
 * In a Chrome extension environment, it uses `chrome.runtime.getURL` to resolve the asset path.
 * Otherwise, it falls back to the raw path or a provided development path.
 *
 * @param prodPath - The path to the asset in the production (extension) environment.
 * @param devPath - (Optional) The path to the asset in the development environment.
 * @returns The resolved asset URL for the current environment.
 */
export const getAssetUrl = (prodPath: string, devPath?: string) => {
  if (typeof chrome !== "undefined" && chrome.runtime?.getURL) {
    return chrome.runtime.getURL(prodPath);
  }
  return devPath ?? prodPath;
};