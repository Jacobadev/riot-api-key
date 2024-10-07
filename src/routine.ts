import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import fs from 'fs'
import { Page } from 'puppeteer';
import { logger } from './logger.js';
import path from 'path';
import { configDotenv } from 'dotenv';
export async function navigateToRiotGames(page: Page) {
  const lol_url = "https://authenticate.riotgames.com/?client_id=riot-developer-portal&locale=en_US&method=riot_identity&platform=web&redirect_uri=https%3A%2F%2Fauth.riotgames.com%2Fauthorize%3Fclient_id%3Driot-developer-portal%26redirect_uri%3Dhttps%253A%252F%252Fdeveloper.riotgames.com%252Foauth2-callback%26response_type%3Dcode%26scope%3Dopenid%2520email%2520summoner%26ui_locales%3Den";
  await page.goto(lol_url, { waitUntil: 'networkidle0' });
  logger.info('Navigated to Riot Games.');
}
export async function openFacebook(page: Page) {
  await page.locator('text/Aceitar').click()
  logger.info('Navigated to the login page.');
  await page.locator('[data-testid="facebook"]').click()
  await page.waitForNavigation()
  logger.info('Facebook opened successfully')

}
export async function facebookLogin(page: Page) {
  configDotenv()
  await page.locator('#email').fill(process.env.FACEBOOK_EMAIL);
  logger.info('Filled username.');

  await page.locator('#pass').fill(process.env.FACEBOOK_PASSWORD);
  logger.info('Filled password.');
  // Click login button
  await page.locator('#loginbutton').click();
  logger.info('Clicked login button.');
  await page.waitForNavigation()
  await page.locator('[aria-label="Continuar como Luiz"]').click(); // Wait for the element to be present
  await page.waitForNavigation()
  logger.info('Logged in successfully.');
}
export async function extractAPIKey(page: Page, name: string) {
  try {
    const apiKey = await page.$eval('#apikey', (el: HTMLInputElement) =>
      el.getAttribute('value')
    );
    const logFilePath = path.join(__dirname, 'apikey.log');

    // Write the API key to the .log file
    fs.appendFile(logFilePath, `${name}: ${apiKey}\n`, 'utf-8', (err) => {
      if (err) {
        logger.error(`Error writing to log file: ${logFilePath}`, err);
      } else {
        logger.info(`API key successfully appended to ${logFilePath}`);
      }
    });

  } catch (error) {
    logger.error('Error extracting or saving API key:', error);
  }
}
