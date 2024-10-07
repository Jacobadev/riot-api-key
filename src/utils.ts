
export async function waitForEver() {
  while (true) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Espera 1 segundo en cada iteración
    console.log('Esperando... Presiona Ctrl+C para detener.');
  }
}
