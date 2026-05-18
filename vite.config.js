import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // El index.html principal (Home)
        main: resolve(__dirname, 'index.html'),
        
        // Las herramientas individuales
        passwordHash: resolve(__dirname, 'tools/password-hash/index.html'),
        permissions: resolve(__dirname, 'tools/permissions/index.html'),
        cronGenerator: resolve(__dirname, 'tools/cron-generator/index.html'),
        subnetCalculator: resolve(__dirname, 'tools/subnet-calculator/index.html')
      }
    }
  }
});