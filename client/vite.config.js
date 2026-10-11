import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // Running the client on its own (`npm run dev` here): send API calls to the
    // Express server (`npm run dev` at the repo root, port 3000) instead of
    // letting Vite answer them with index.html.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
