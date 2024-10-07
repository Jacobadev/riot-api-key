import path from "path";
import puppeteer, { Browser } from "puppeteer";
import { logger } from "./logger.js";

export async function setupBrowser() {

  const pathToExtension = path.join(process.cwd(), './capmonster-extension');
  const browser = await launchBrowser(pathToExtension);
  const page = await browser.newPage();
  logger.info('Browser Started');

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36');
  await page.setViewport({ width: 1280, height: 800 });
  return { page, browser }

}

export async function launchBrowser(extensionPath: string): Promise<Browser> {
  logger.info('Launching browser with extension...');
  return puppeteer.launch({
    headless: false,
    timeout: 0,
    args: [
      // `--disable-extensions-except=${extensionPath}`,
      // `--load-extension=${extensionPath}`,
    ],
  });
}
