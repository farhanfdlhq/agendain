'use client'

import { useState, useEffect, useRef, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Check, Copy, Mail, Link2, Share2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

/** Ikon brand (inline SVG, fill currentColor) — lucide tak menyediakan logo brand. */
const Icon = ({ path }: { path: string }) => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d={path} />
  </svg>
)
const PATH = {
  whatsapp: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z',
  telegram: 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z',
  facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  x: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
}

type Target = { key: string; label: string; color: string; href: string; icon: ReactNode }

export default function ShareModal({
  open,
  onOpenChange,
  title,
  language = 'id',
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  language?: string
}) {
  const en = language === 'en'
  const reduce = useReducedMotion()
  const [url, setUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const [canNativeShare, setCanNativeShare] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // URL & kemampuan native share hanya diketahui di klien (hindari mismatch SSR).
  useEffect(() => {
    if (typeof window === 'undefined') return
    setUrl(window.location.href)
    setCanNativeShare(typeof navigator !== 'undefined' && !!navigator.share)
  }, [open])

  const enc = encodeURIComponent
  const shareText = `${title}`
  const targets: Target[] = [
    { key: 'whatsapp', label: 'WhatsApp', color: '#25D366', href: `https://wa.me/?text=${enc(`${shareText} ${url}`)}`, icon: <Icon path={PATH.whatsapp} /> },
    { key: 'telegram', label: 'Telegram', color: '#229ED9', href: `https://t.me/share/url?url=${enc(url)}&text=${enc(shareText)}`, icon: <Icon path={PATH.telegram} /> },
    { key: 'facebook', label: 'Facebook', color: '#1877F2', href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, icon: <Icon path={PATH.facebook} /> },
    { key: 'x', label: 'X', color: '#000000', href: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(shareText)}`, icon: <Icon path={PATH.x} /> },
    { key: 'linkedin', label: 'LinkedIn', color: '#0A66C2', href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`, icon: <Icon path={PATH.linkedin} /> },
    { key: 'email', label: 'Email', color: '#6B7280', href: `mailto:?subject=${enc(title)}&body=${enc(url)}`, icon: <Mail size={22} /> },
  ]

  const openShare = (t: Target) => {
    if (t.key === 'email') { window.location.href = t.href; return }
    window.open(t.href, '_blank', 'noopener,noreferrer,width=600,height=600')
  }

  const flagCopied = () => {
    setCopyFailed(false)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopy = async () => {
    // 1) Clipboard API (butuh konteks secure/HTTPS).
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
        flagCopied()
        return
      }
    } catch { /* lanjut ke fallback */ }
    // 2) Fallback: pilih teks lalu execCommand (browser lama / non-secure).
    const input = inputRef.current
    if (input) {
      input.focus()
      input.select()
      try {
        if (document.execCommand('copy')) { flagCopied(); return }
      } catch { /* lanjut */ }
    }
    // 3) Tetap gagal: minta user salin manual (teks sudah ter-select).
    setCopyFailed(true)
    setTimeout(() => setCopyFailed(false), 4000)
  }

  const nativeShare = async () => {
    try {
      await navigator.share({ title, url })
    } catch { /* user batal / tak didukung */ }
  }

  // Micro-animation: kartu "pop" lalu ikon brand muncul berurutan (cascade).
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.045, delayChildren: reduce ? 0 : 0.08 } },
  }
  const item = {
    hidden: { opacity: 0, scale: 0.6, y: 8 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, stiffness: 520, damping: 24 } },
  }
  const fadeUp = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const } },
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md border-[color:var(--color-hairline,#e5e7eb)] bg-white shadow-2xl"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-[color:var(--color-ink,#0f172a)]">
            <Share2 size={20} className="text-[color:var(--color-primary,#14577d)]" />
            {en ? 'Share this article' : 'Bagikan artikel ini'}
          </DialogTitle>
          <DialogDescription className="line-clamp-2 text-[color:var(--color-muted,#64748b)]">
            {title}
          </DialogDescription>
        </DialogHeader>

        {/* Grid tujuan share — ikon brand berwarna, muncul cascade saat modal terbuka. */}
        <motion.div
          variants={container}
          initial={reduce ? false : 'hidden'}
          animate="show"
          className="grid grid-cols-3 gap-3 py-2 sm:grid-cols-6"
        >
          {targets.map((t) => (
            <motion.button
              key={t.key}
              type="button"
              variants={reduce ? undefined : item}
              whileTap={{ scale: 0.9 }}
              onClick={() => openShare(t)}
              className="group flex flex-col items-center gap-2 rounded-lg p-2 transition-colors hover:bg-[var(--color-surface-soft,#f1f5f9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary,#14577d)]"
              aria-label={en ? `Share on ${t.label}` : `Bagikan ke ${t.label}`}
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-sm transition-transform group-hover:scale-110"
                style={{ backgroundColor: t.color }}
              >
                {t.icon}
              </span>
              <span className="text-xs font-medium text-[color:var(--color-muted,#64748b)]">{t.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Salin tautan — input read-only + tombol dengan feedback tersalin. */}
        <motion.div
          variants={reduce ? undefined : fadeUp}
          initial={reduce ? false : 'hidden'}
          animate="show"
          transition={reduce ? undefined : { delay: 0.28 }}
          className="flex items-center gap-2 rounded-lg border border-[color:var(--color-hairline,#e5e7eb)] bg-[var(--color-surface-soft,#f8fafc)] p-1.5"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center text-[color:var(--color-muted,#64748b)]">
            <Link2 size={18} />
          </span>
          <input
            ref={inputRef}
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            className="min-w-0 flex-1 bg-transparent text-sm text-[color:var(--color-muted,#64748b)] outline-none"
            aria-label={en ? 'Article link' : 'Tautan artikel'}
          />
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-white transition-colors',
              copied ? 'bg-emerald-500' : 'bg-[var(--color-primary,#14577d)] hover:opacity-90'
            )}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? (en ? 'Copied' : 'Tersalin') : (en ? 'Copy' : 'Salin')}
          </button>
        </motion.div>

        {copyFailed && (
          <p className="text-center text-xs text-[color:var(--color-muted,#64748b)]">
            {en
              ? 'Auto-copy blocked — link selected, press Ctrl/Cmd + C.'
              : 'Salin otomatis diblokir — tautan sudah dipilih, tekan Ctrl/Cmd + C.'}
          </p>
        )}

        {canNativeShare && (
          <motion.button
            type="button"
            onClick={nativeShare}
            variants={reduce ? undefined : fadeUp}
            initial={reduce ? false : 'hidden'}
            animate="show"
            transition={reduce ? undefined : { delay: 0.34 }}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[color:var(--color-hairline,#e5e7eb)] py-2.5 text-sm font-medium text-[color:var(--color-ink,#0f172a)] transition-colors hover:bg-[var(--color-surface-soft,#f1f5f9)]"
          >
            <Share2 size={16} /> {en ? 'More options...' : 'Opsi lainnya...'}
          </motion.button>
        )}
      </DialogContent>
    </Dialog>
  )
}
