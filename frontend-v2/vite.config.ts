import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }: { mode: string }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  console.log(env.VITE_API_BASE_URL);
  
  
  return {
    plugins: [
      react(),
    ],
    server: {
      port: 3000,
      cors: true, // Enable CORS for Vite dev server
      proxy: {
        // Proxy API requests to backend during development
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false
        }
      }
    },
    define: {
      // Make env variables available at build time
      __APP_ENV__: JSON.stringify(mode),
    },
    build: {
      // Environment-specific build options
      minify: mode === 'production',
      sourcemap: mode === 'development',
    }
  }
})
