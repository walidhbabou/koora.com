import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Dev-time proxy to forward /api/football to the real API and inject API key
    proxy: {
      '/api/football': {
        target: 'https://v3.football.api-sports.io',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/football/, ''),
        configure: (proxy, options) => {
          // Add API key header on proxied requests
          proxy.on('proxyReq', (proxyReq, req, res) => {
            const key = process.env.VITE_FOOTBALL_API_KEY || process.env.FOOTBALL_API_KEY || '';
            if (key) {
              proxyReq.setHeader('x-apisports-key', key);
              proxyReq.setHeader('X-RapidAPI-Key', key);
              proxyReq.setHeader('X-RapidAPI-Host', 'v3.football.api-sports.io');
            }
          });
        }
      }
    }
  },
  optimizeDeps: {
  include: ["buffer", "process", "util"]
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
