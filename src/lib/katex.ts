// KaTeX for maths in comments. It is imported only when a comment contains a $, so posts whose
// comments have no maths never load it. trust: false keeps \href, \url and HTML-producing commands
// out, so a comment can only ever produce maths; maxSize and maxExpand keep pathological input small.
import katex from 'katex'
import 'katex/dist/katex.min.css'

export function renderMath(tex: string, display: boolean): string {
  return katex.renderToString(tex, {
    displayMode: display, throwOnError: false, trust: false, strict: 'ignore',
    maxSize: 20, maxExpand: 200, output: 'htmlAndMathml',
  })
}
