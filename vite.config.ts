import { defineConfig, loadEnv } from 'vite';
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Debug: Log environment variables during build
  console.log('Build mode:', mode);
  console.log('Available VITE_ vars:', Object.keys(env).filter(key => key.startsWith('VITE_')));
  
  return {
    server: {
      host: "::",
      port: 8080,
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
    // Expose env variables to the client
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
      // Explicitly define Supabase variables for production
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      'import.meta.env.VITE_APP_NAME': JSON.stringify(env.VITE_APP_NAME),
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(env.VITE_APP_VERSION),
      'import.meta.env.VITE_DEV_MODE': JSON.stringify(env.VITE_DEV_MODE),
      'import.meta.env.VITE_DEBUG_MODE': JSON.stringify(env.VITE_DEBUG_MODE),
    },
    // Ensure environment variables are available
    envPrefix: 'VITE_',
    // Build configuration for better compatibility
    build: {
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'esbuild' : false,
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
  };
});
