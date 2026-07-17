import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4202, // Replace 3000 with your preferred port number
    strictPort: true, // Optional: Prevents Vite from automatically trying the next available port if taken
  },
});
