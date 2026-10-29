/**
 * Journals are plain text since v73. Older entries were saved as HTML by the
 * rich-text editor: turn those into text, keeping their line breaks.
 */
export function journalText(value: string | null | undefined) {
  const s = value ?? ''
  if (!/<[a-z/][^>]*>/i.test(s)) return s
  return s
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|ul|ol|h\d)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'')
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
