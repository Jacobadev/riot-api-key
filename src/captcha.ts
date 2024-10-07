import axios from 'axios'
import { logger } from './logger.js';
import { Page } from 'puppeteer';
import dotenv from 'dotenv'
export async function solveCaptcha(): Promise<string> {
  dotenv.config()
  logger.info('Setting up CapMonster');
  const apiKey = process.env.CAPMONSTER_API_KEY; // Replace with your CapMonster API key
  const siteKey = '6LcOGicUAAAAAI8bWJ6IYXt5teyzO-t4aKskR5Iz';
  const websiteURL = 'https://developer.riotgames.com/';

  const taskData = {
    clientKey: apiKey,
    task: {
      type: "RecaptchaV2TaskProxyless",
      websiteURL: websiteURL,
      websiteKey: siteKey
    }
  };

  try {
    const createTaskResponse = await axios.post('https://api.capmonster.cloud/createTask', taskData);
    logger.info('Create Task Response:', createTaskResponse.data); // Log response
    const taskId = createTaskResponse.data.taskId;

    if (!taskId) {
      throw new Error('No taskId received from CapMonster.');
    }

    const resultData = {
      clientKey: apiKey,
      taskId: taskId
    };

    let result;
    let attemptCount = 0;
    const MAX_ATTEMPTS = 30; // Limit attempts to prevent infinite loops

    logger.info('Waiting for CAPTCHA to be ready...');
    while (true) {
      attemptCount++;
      const getResultResponse = await axios.post('https://api.capmonster.cloud/getTaskResult', resultData);
      result = getResultResponse.data;

      if (result.status === 'ready') {
        const captchaSolution = result.solution.gRecaptchaResponse;
        logger.info(`CAPTCHA Solved: ${captchaSolution}`);
        return captchaSolution;
      }

      // Log status for debugging
      logger.info(`Current status: ${result.status}`);

      // Wait before trying again
      await new Promise(res => setTimeout(res, 5000));

      // Check for max attempts
      if (attemptCount >= MAX_ATTEMPTS) {
        logger.error('Max attempts reached, stopping...');
        throw new Error('Max attempts reached');
      }
    }
  } catch (error) {
    logger.error('Error solving CAPTCHA:', error);
    throw error; // Rethrow the error to handle it upstream
  }
}
export async function evaluateCaptchaSolution(page: Page, captchaSolution: string) {
  try {
    // Wait for the CAPTCHA field to be present on the page
    logger.info('Filling the CAPTCHA solution...');
    // Fill the CAPTCHA solution into the hidden field and dispatch necessary events
    await page.evaluate((captchaResponse) => {
      const recaptchaElement = document.querySelector<HTMLTextAreaElement>('#g-recaptcha-response');
      if (recaptchaElement) {
        recaptchaElement.value = captchaResponse;
        // Trigger events to ensure the page acknowledges the change
        recaptchaElement.dispatchEvent(new Event('input', { bubbles: true }));
        recaptchaElement.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, captchaSolution);

    logger.info('Captcha solution filled and events dispatched.');



  } catch (error) {
    logger.error('Error solving CAPTCHA or checking success:', error);
    return false;
  }
}
