import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { renderJsonLd, renderSeoHtml } from './scripts/seo'

/**
 * The site draws its content inside a simulated desktop, so a crawler that
 * does not open windows sees almost no text. This injects the same content as
 * real markup into the delivered HTML, generated from `src/content.ts` so the
 * two cannot drift.
 *
 * React clears `#root` when it mounts, so visitors with JavaScript never see
 * it. Visitors without JavaScript get a readable page instead of a blank one.
 */
function seoContent() {
  return {
    name: 'seo-content',
    transformIndexHtml(html: string) {
      return html
        .replace('<!--seo-content-->', renderSeoHtml())
        .replace('<!--seo-jsonld-->', renderJsonLd())
    },
  }
}

// ponytail: base is './' so the same build works on GitHub Pages project
// sites, Vercel, Netlify, or a plain file:// open.
export default defineConfig({
  base: './',
  plugins: [react(), seoContent()],
})
