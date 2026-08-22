import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizer tunggal untuk konten rich text (output TipTap) yang dipakai di
 * SEMUA permukaan render depan: blog, kebijakan privasi, tentang.
 *
 * Allowlist tag & atribut sengaja dicocokkan dengan schema editor
 * (components/ui/tiptap-editor.tsx): StarterKit + Underline + TextAlign +
 * Link + Image. Dengan begitu apa pun yang bisa dibuat editor tampil identik
 * di depan (WYSIWYG), sementara markup/atribut berbahaya tetap dibuang oleh
 * DOMPurify (mis. `javascript:`, event handler `onerror`, `<script>`).
 *
 * Catatan: regex URI aman bawaan DOMPurify memblok skema berbahaya tapi tetap
 * meloloskan URL relatif (mis. `/uploads/foo.webp`), jadi kita tidak override.
 */
const ALLOWED_TAGS = [
  "p",
  "br",
  "hr",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "del",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "blockquote",
  "pre",
  "code",
  "span",
];

const ALLOWED_ATTR = [
  "href",
  "target",
  "rel",
  "src",
  "alt",
  "title",
  "class",
  "style",
];

export function sanitizeRichText(value: unknown): string {
  if (typeof value !== "string" || !value) return "";
  return DOMPurify.sanitize(value, { ALLOWED_TAGS, ALLOWED_ATTR });
}
