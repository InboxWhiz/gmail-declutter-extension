const puppeteer = require("puppeteer");
const path = require("path");

const EXTENSION_PATH = path.resolve(__dirname, "../extension");
const EXTENSION_ID = "ohanekenlbhghgfgfkciikfdchgljkma";

let browser;

beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
    ],
  });
});

afterEach(async () => {
  await browser.close();
  browser = undefined;
});

test("hello world test", async () => {
  const page = await browser.newPage();
  await page.goto(`chrome-extension://${EXTENSION_ID}/content/ui/declutter_body.html`);

  const buttonBar = await page.$(".button-bar");
  const children = await buttonBar.$$("button");

  expect(children.length).toBe(3);
});
