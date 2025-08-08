/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FOOTBALL_API_KEY: string
  readonly VITE_NEWS_API: string
  readonly VITE_MATCHES_API: string
  readonly VITE_STANDINGS_API: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
