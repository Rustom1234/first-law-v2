import { defineConfig } from 'vite';

// Relative base so the built dist/ folder is relocatable (e.g. dropped into
// another site's directory or opened straight from disk), matching how the
// other portfolio mockups are viewed.
export default defineConfig({
  base: './',
});
