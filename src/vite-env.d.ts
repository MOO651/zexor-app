/// <reference types="vite/client" />

// Single typed source of truth for every VITE_* variable this app reads.
// Add a `readonly` property here (and to `.env.example`) whenever a new
// environment variable is introduced, so `import.meta.env.X` stays typed.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
