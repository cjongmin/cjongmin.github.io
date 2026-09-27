import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

/**
 * Rewrite px lengths as rem (16px = 1rem) after Tailwind has generated its
 * CSS, so every size follows the root font size, which index.css enlarges on
 * very wide screens. 1px hairlines stay in px, and media queries are at-rule
 * params rather than declarations, so breakpoints are never touched.
 */
function pxToRem() {
  return {
    postcssPlugin: 'px-to-rem',
    Declaration(decl) {
      if (!decl.value.includes('px')) return
      decl.value = decl.value.replace(/(-?\d*\.?\d+)px\b/g, (match, n) => {
        const px = parseFloat(n)
        return Math.abs(px) < 2 ? match : `${+(px / 16).toFixed(4)}rem`
      })
    },
  }
}
pxToRem.postcss = true

export default {
  plugins: [tailwindcss(), autoprefixer(), pxToRem()],
}
