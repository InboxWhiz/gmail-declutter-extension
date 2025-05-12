export const getAssetUrl = (prodPath: string, devPath?: string) => {
  if (typeof chrome !== "undefined" && chrome.runtime?.getURL) {
    return chrome.runtime.getURL(prodPath);
  }
  return devPath ?? prodPath;
};
