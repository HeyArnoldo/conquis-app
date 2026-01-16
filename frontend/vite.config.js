import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
const parsePort = (value, fallback) => {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'APP_');
  const devPort = parsePort(env.APP_PORT, 5173);
  const previewPort = parsePort(env.APP_PORT, 23500);

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    define: {
      'process.env': process.env,
    },
    envPrefix: 'APP_',
    server: {
      port: devPort,
    },
    preview: {
      port: previewPort,
      allowedHosts: ['conquis.joaosouza.studio', 'localhost'],
    },
  };
});
