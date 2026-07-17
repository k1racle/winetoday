export function stripTextColor(html: string): string {
  if (!html) return html;

  // Remove <font color="..."> tags, keeping their content.
  html = html.replace(/<\/?font[^>]*>/gi, '');

  // Remove the `color` CSS property from inline style attributes.
  html = html.replace(/\sstyle="([^"]*)"/gi, (match, styleValue: string) => {
    const cleaned = styleValue
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((prop) => !/^color\s*:/i.test(prop))
      .join('; ');
    return cleaned ? ` style="${cleaned};"` : '';
  });

  // Remove legacy color attributes (e.g. <span color="#000">).
  html = html.replace(/\scolor="[^"]*"/gi, '');

  return html;
}
