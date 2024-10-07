
import { logger } from './logger.js';
import { navigateToRiotGames, openFacebook, facebookLogin, extractAPIKey } from './routine.js';
import { waitForEver } from './utils.js';
import { setupBrowser } from './setup.js';
import { evaluateCaptchaSolution, solveCaptcha } from './captcha.js';

(async () => {
  const { page, browser } = await setupBrowser();
  try {
    await navigateToRiotGames(page)
    await openFacebook(page)
    await facebookLogin(page)
    await extractAPIKey(page, 'old_apikey')
    const captchaSolution = await solveCaptcha()
    await evaluateCaptchaSolution(page, captchaSolution)
    await page.locator('input[name="confirm_action"]').click()
    await page.waitForSelector('text/API Key generated successfully!')
    await extractAPIKey(page, 'new_apikey')
    await waitForEver()
  } catch (error) {
    logger.error(`An error occurred during the automation process: ${error.message}`);
  } finally {
    await browser.close();
    logger.info('Browser closed.');
  }
})();
