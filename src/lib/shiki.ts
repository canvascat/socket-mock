import { codeToHtml } from 'shiki/bundle/web'

// export function codeToHtml1(code: string, lang: string) {
//   return codeToHtml(code, { lang })
// }

export function logs2html(logs: string[]) {
  const code = logs.join('\n')
  return codeToHtml(code, { lang: 'log', themes: { light: 'min-light', dark: 'min-dark' } })
}
