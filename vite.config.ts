import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the built site works on GitHub Pages project URLs
  // (https://<user>.github.io/<repo>/) as well as on a custom domain.
  base: './',
  plugins: [tailwindcss(), react()],
  build: {
    // Split vendor libraries away from app code so a content change does not
    // invalidate React / framer-motion in the browser cache.
    // Rollup 4 expects a function here, not an object map.
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('/react/')) return 'react-vendor';
            if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) {
              return 'motion-vendor';
            }
            if (id.includes('lucide-react')) return 'icons-vendor';
            return 'vendor';
          }
          return undefined;
        },
      },
    },
    // The remaining app chunk is still sizeable; keep the ceiling realistic.
    chunkSizeWarningLimit: 600,
  },
})
