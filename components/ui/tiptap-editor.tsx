'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import LinkExt from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { useEffect, useRef, useState } from 'react'
import {
  Bold, Italic, Strikethrough, Underline as UnderlineIcon,
  Heading1, Heading2, Heading3, List, ListOrdered,
  Undo, Redo, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link as LinkIcon, Unlink, ImagePlus, Pencil, ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import { useConfirm } from '@/components/Providers/ConfirmProvider'

interface TiptapEditorProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
}

export function TiptapEditor({ value, onChange, placeholder = 'Mulai menulis...' }: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const popRef = useRef<HTMLDivElement>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Popover link: muncul saat hover sebuah tautan di editor — menampilkan URL
  // (bisa dibuka), tombol edit, dan unlink. `el` = elemen <a> yang di-hover.
  const [linkPop, setLinkPop] = useState<{ href: string; top: number; left: number; el: HTMLElement } | null>(null)
  const { prompt } = useConfirm()

  const editor = useEditor({
    extensions: [
      // TipTap 3 sudah membundel Link & Underline di StarterKit. Dimatikan di sini
      // agar tidak duplikat dengan registrasi eksplisit di bawah (Link butuh
      // konfigurasi openOnClick/autolink sendiri).
      StarterKit.configure({ link: false, underline: false }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      // openOnClick:false -> di editor tidak langsung membuka (bisa diklik untuk edit).
      // HTMLAttributes -> tautan yang tersimpan membuka di tab baru + rel aman saat
      // dirender di halaman depan (perilaku blog umum).
      LinkExt.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
        HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer nofollow' },
      }),
      Placeholder.configure({ placeholder }),
      Image.configure({ inline: false, allowBase64: false }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'blog')
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.url) {
        toast.error(data.error || 'Gagal mengunggah gambar.')
        return
      }
      editor.chain().focus().setImage({ src: data.url }).run()
    } catch {
      toast.error('Terjadi kesalahan koneksi saat mengunggah gambar.')
    } finally {
      e.target.value = ''
    }
  }

  if (!editor) return null

  // Prompt URL (dipakai tombol toolbar & edit dari popover).
  const promptLink = (currentHref: string) => prompt({
    title: 'Sisipkan tautan',
    message: 'Alamat lengkap, termasuk https://',
    defaultValue: currentHref || '',
    placeholder: 'https://contoh.com',
    confirmText: 'Sisipkan',
  })

  // Pilih rentang mark link tepat pada elemen <a> yang dituju (agar edit/unlink
  // mengenai tautan yang benar walau kursor tidak sedang di dalamnya).
  const pilihLinkDi = (el: HTMLElement): boolean => {
    try {
      const pos = editor.view.posAtDOM(el, 0)
      if (pos == null || pos < 0) return false
      editor.chain().setTextSelection(pos).extendMarkRange('link').run()
      return true
    } catch { return false }
  }

  const batalSembunyi = () => { if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null } }
  const sembunyikanNanti = () => { batalSembunyi(); hideTimer.current = setTimeout(() => setLinkPop(null), 300) }

  const onEditorMouseOver = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    // Mouse di atas popover: JANGAN jadwalkan sembunyi — biar handler popover yang
    // mengatur. Ini yang dulu membuatnya hilang saat mouse digeser ke tombol edit/unlink.
    if (popRef.current?.contains(target)) { batalSembunyi(); return }
    const a = target?.closest?.('a') as HTMLElement | null
    const cont = containerRef.current
    if (a && cont && cont.contains(a) && !popRef.current?.contains(a)) {
      batalSembunyi()
      if (linkPop?.el === a) return // sudah tampil untuk link ini — jangan re-render (cegah flicker)
      const ar = a.getBoundingClientRect()
      const cr = cont.getBoundingClientRect()
      setLinkPop({ href: a.getAttribute('href') || '', top: ar.bottom - cr.top + 6, left: Math.max(0, ar.left - cr.left), el: a })
      return
    }
    // Area editor non-link: jadwalkan sembunyi (300ms cukup untuk menyeberang celah
    // ke popover; onMouseEnter popover akan membatalkannya).
    sembunyikanNanti()
  }

  const editLink = async () => {
    const el = linkPop?.el
    if (!el || !pilihLinkDi(el)) return
    const url = await promptLink(editor.getAttributes('link').href || linkPop?.href || '')
    if (url) editor.chain().focus().setLink({ href: url }).run()
    setLinkPop(null)
  }

  const unlink = () => {
    const el = linkPop?.el
    if (el && pilihLinkDi(el)) editor.chain().focus().unsetLink().run()
    setLinkPop(null)
  }

  const ToolBtn = ({ active, onClick, children, title }: { active: boolean; onClick: () => void; children: React.ReactNode; title: string }) => (
    <Button type="button" variant={active ? 'default' : 'ghost'} size="sm" className="h-8 w-8 p-0" onClick={onClick} title={title}>
      {children}
    </Button>
  )

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-0.5 p-2 border-b bg-muted/30">
        <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold"><Bold size={16} /></ToolBtn>
        <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic"><Italic size={16} /></ToolBtn>
        <ToolBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline"><UnderlineIcon size={16} /></ToolBtn>
        <ToolBtn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough"><Strikethrough size={16} /></ToolBtn>
        <span className="w-px h-6 bg-border self-center mx-1" />
        <ToolBtn active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="H1"><Heading1 size={16} /></ToolBtn>
        <ToolBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="H2"><Heading2 size={16} /></ToolBtn>
        <ToolBtn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="H3"><Heading3 size={16} /></ToolBtn>
        <span className="w-px h-6 bg-border self-center mx-1" />
        <ToolBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List"><List size={16} /></ToolBtn>
        <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered List"><ListOrdered size={16} /></ToolBtn>
        <span className="w-px h-6 bg-border self-center mx-1" />
        <ToolBtn active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Align Left"><AlignLeft size={16} /></ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Align Center"><AlignCenter size={16} /></ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Align Right"><AlignRight size={16} /></ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()} title="Justify"><AlignJustify size={16} /></ToolBtn>
        <span className="w-px h-6 bg-border self-center mx-1" />
        <ToolBtn active={editor.isActive('link')} onClick={async () => {
          const url = await promptLink(editor.getAttributes('link').href || '')
          if (url) editor.chain().focus().setLink({ href: url }).run()
        }} title="Insert Link"><LinkIcon size={16} /></ToolBtn>
        <ToolBtn active={false} onClick={() => editor.chain().focus().unsetLink().run()} title="Remove Link"><Unlink size={16} /></ToolBtn>
        <ToolBtn active={false} onClick={() => fileInputRef.current?.click()} title="Insert Image"><ImagePlus size={16} /></ToolBtn>
        <span className="w-px h-6 bg-border self-center mx-1" />
        <ToolBtn active={false} onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo size={16} /></ToolBtn>
        <ToolBtn active={false} onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo size={16} /></ToolBtn>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

      {/* Editor Content — kelas .richtext sama dengan render depan (WYSIWYG).
          Container relatif menampung popover link (posisi absolut). */}
      <div ref={containerRef} className="relative" onMouseOver={onEditorMouseOver} onMouseLeave={sembunyikanNanti}>
        <EditorContent editor={editor} className="richtext p-4 min-h-[300px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[280px] [&_.ProseMirror_a]:cursor-pointer [&_.is-editor-empty:first-child::before]:text-muted-foreground [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:pointer-events-none [&_.is-editor-empty:first-child::before]:h-0" />

        {linkPop && (
          <div
            ref={popRef}
            className="absolute z-30 flex max-w-[320px] items-center gap-1 rounded-lg border bg-popover px-2 py-1 text-xs shadow-md"
            style={{ top: linkPop.top, left: linkPop.left }}
            onMouseEnter={batalSembunyi}
            onMouseLeave={sembunyikanNanti}
          >
            <a href={linkPop.href} target="_blank" rel="noopener noreferrer"
              className="flex min-w-0 items-center gap-1 truncate text-primary hover:underline"
              title={linkPop.href}>
              <ExternalLink size={12} className="shrink-0" />
              <span className="truncate">{linkPop.href || '(tanpa URL)'}</span>
            </a>
            <span className="mx-0.5 h-4 w-px shrink-0 bg-border" />
            <button type="button" onClick={editLink} title="Edit tautan"
              className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
              <Pencil size={13} />
            </button>
            <button type="button" onClick={unlink} title="Hapus tautan"
              className="shrink-0 rounded p-1 text-destructive hover:bg-destructive/10">
              <Unlink size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
