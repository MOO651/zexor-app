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
          const moduleId = id.replaceAll('\\', '/');
          if (moduleId.includes('node_modules')) {
            if (
              moduleId.includes('/@react-three/')
              || moduleId.includes('/three/')
              || moduleId.includes('/three-stdlib/')
              || moduleId.includes('/troika-')
              || moduleId.includes('/camera-controls/')
              || moduleId.includes('/maath/')
              || moduleId.includes('/meshline/')
              || moduleId.includes('/suspend-react/')
            ) return 'webgl-vendor';
            if (moduleId.includes('react-dom') || moduleId.includes('/react/')) return 'react-vendor';
            if (moduleId.includes('framer-motion') || moduleId.includes('motion-dom') || moduleId.includes('motion-utils')) {
              return 'motion-vendor';
            }
            if (moduleId.includes('lucide-react')) return 'icons-vendor';
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
