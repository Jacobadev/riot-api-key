import { logger } from "./logger.js";

export async function waitForEver() {
  while (true) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Espera 1 segundo en cada iteración
    logger.info('Esperando... Presiona Ctrl+C para detener.');
  }
}
