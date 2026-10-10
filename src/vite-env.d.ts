/// <reference types="vite/client" />

// Single typed source of truth for every VITE_* variable this app reads.
// Add a `readonly` property here (and to `.env.example`) whenever a new
// environment variable is introduced, so `import.meta.env.X` stays typed.
interface ImportMetaEnv {
  /**
   * Admin studio password for the protected /dashboard route.
   * Optional: `src/App.tsx` falls back to a local demo password when unset.
   */
  readonly VITE_ADMIN_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
