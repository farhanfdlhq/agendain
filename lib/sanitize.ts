const allowedHtmlTags = new Set([
  "a",
  "br",
  "em",
  "h2",
  "h3",
  "li",
  "ol",
  "p",
  "strong",
  "ul",
]);

// Tag-tag ini harus dibuang beserta isinya, bukan hanya tag pembuka/penutupnya.
const rawTextTags =
  /<\s*(script|style|iframe|object|embed|template|noscript|svg|math)\b[\s\S]*?(?:<\s*\/\s*\1\s*>|$)/gi;

function escapeHtml(text: string) {
  return text
    .replace(/&(?!#?[a-zA-Z0-9]+;)/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeAttrs(tag: string, attrs: string) {
  if (tag !== "a") return "";

  const hrefMatch = attrs.match(
    /\s+href\s*=\s*(?:(["'])([\s\S]*?)\1|([^\s"'>]+))/i,
  );
  if (!hrefMatch) return "";

  const href = (hrefMatch[2] ?? hrefMatch[3] ?? "").trim();
  // Allowlist protokol: apa pun selain ini (javascript:, data:, vbscript:) ditolak.
  if (!/^(https?:|mailto:|tel:|#)/i.test(href)) return "";

  return ` href="${escapeHtml(href)}" rel="noopener noreferrer"`;
}

export function sanitizeHtml(value: unknown) {
  if (typeof value !== "string") return "";

  const stripped = value
    .replace(rawTextTags, "")
    .replace(/<!--[\s\S]*?(?:-->|$)/g, "");

  // Satu lintasan: setiap potongan teks di-escape, hanya tag allowlist yang
  // diloloskan. Dengan begitu markup sisa (termasuk "<" menggantung) tidak
  // pernah sampai ke browser dalam bentuk mentah.
  const tagPattern = /<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g;
  let out = "";
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(stripped)) !== null) {
    out += escapeHtml(stripped.slice(cursor, match.index));
    cursor = tagPattern.lastIndex;

    const tag = match[2].toLowerCase();
    if (!allowedHtmlTags.has(tag)) continue;

    out += match[1]
      ? `</${tag}>`
      : `<${tag}${sanitizeAttrs(tag, match[3] || "")}>`;
  }

  return out + escapeHtml(stripped.slice(cursor));
}
