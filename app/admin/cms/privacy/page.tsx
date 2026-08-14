"use client"

import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { Save, Globe } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AirplaneLoader from "@/components/ui/airplane-loader"
import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import { Bold, Italic, Strikethrough, Underline as UnderlineIcon, Heading1, Heading2, Heading3, List, ListOrdered, Undo, Redo, AlignLeft, AlignCenter, AlignRight, AlignJustify, Link as LinkIcon, Unlink } from 'lucide-react'
import { MediaPicker } from "@/components/ui/media-picker"
import { FontWeightPicker } from "@/components/ui/font-weight-picker"

const TiptapEditor = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({
        placeholder: 'Mulai menulis kebijakan privasi di sini...',
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  if (!editor) return null

  return (
    <div className="rounded-xl bg-white max-w-4xl shadow-sm border border-slate-200">
      {/* Minimal Top Toolbar for Block Styles */}
      <div className="rounded-t-xl bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center gap-1 flex-wrap text-slate-600 sticky top-0 z-10 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        
        {/* Font Size (Heading) */}
        <select
          onChange={(e) => {
            const val = e.target.value;
            if (val === 'p') editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: parseInt(val) as any }).run();
          }}
          value={
            editor.isActive('heading', { level: 1 }) ? '1' :
            editor.isActive('heading', { level: 2 }) ? '2' :
            editor.isActive('heading', { level: 3 }) ? '3' : 'p'
          }
          className="bg-white border border-slate-300 text-slate-700 rounded-md px-2 py-1.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-slate-400 transition-all cursor-pointer mr-2 shadow-xs"
        >
          <option value="p">Normal Text</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>
        
        <div className="w-[1px] h-5 bg-slate-300 mx-1" />

        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 rounded hover:text-slate-900 hover:bg-slate-200 transition-colors ${editor.isActive('bold') ? 'bg-slate-200 text-slate-900 shadow-inner' : ''}`} title="Bold"><Bold size={16} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 rounded hover:text-slate-900 hover:bg-slate-200 transition-colors ${editor.isActive('italic') ? 'bg-slate-200 text-slate-900 shadow-inner' : ''}`} title="Italic"><Italic size={16} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-1.5 rounded hover:text-slate-900 hover:bg-slate-200 transition-colors ${editor.isActive('underline') ? 'bg-slate-200 text-slate-900 shadow-inner' : ''}`} title="Underline"><UnderlineIcon size={16} /></button>
        
        <div className="w-[1px] h-5 bg-slate-300 mx-1" />

        <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-1.5 rounded hover:text-slate-900 hover:bg-slate-200 transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-slate-200 text-slate-900 shadow-inner' : ''}`} title="Align Left"><AlignLeft size={16} /></button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-1.5 rounded hover:text-slate-900 hover:bg-slate-200 transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-slate-200 text-slate-900 shadow-inner' : ''}`} title="Align Center"><AlignCenter size={16} /></button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`p-1.5 rounded hover:text-slate-900 hover:bg-slate-200 transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-slate-200 text-slate-900 shadow-inner' : ''}`} title="Align Right"><AlignRight size={16} /></button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`p-1.5 rounded hover:text-slate-900 hover:bg-slate-200 transition-colors ${editor.isActive({ textAlign: 'justify' }) ? 'bg-slate-200 text-slate-900 shadow-inner' : ''}`} title="Justify"><AlignJustify size={16} /></button>

        <div className="w-[1px] h-5 bg-slate-300 mx-1" />
        
        <button type="button" onClick={() => {
          const url = window.prompt('URL:');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          } else if (url === '') {
            editor.chain().focus().unsetLink().run();
          }
        }} className={`p-1.5 rounded hover:text-slate-900 hover:bg-slate-200 transition-colors ${editor.isActive('link') ? 'bg-slate-200 text-slate-900 shadow-inner' : ''}`} title="Add Link"><LinkIcon size={16} /></button>
        <button type="button" onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive('link')} className="p-1.5 rounded hover:text-slate-900 hover:bg-slate-200 disabled:opacity-30 transition-colors" title="Remove Link"><Unlink size={16} /></button>

        <div className="w-[1px] h-5 bg-slate-300 mx-1" />

        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded hover:text-slate-900 hover:bg-slate-200 transition-colors ${editor.isActive('bulletList') ? 'bg-slate-200 text-slate-900 shadow-inner' : ''}`} title="Bullet List"><List size={16} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-1.5 rounded hover:text-slate-900 hover:bg-slate-200 transition-colors ${editor.isActive('orderedList') ? 'bg-slate-200 text-slate-900 shadow-inner' : ''}`} title="Numbered List"><ListOrdered size={16} /></button>

        <div className="flex-1" />
        
        <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="p-1.5 rounded hover:text-slate-900 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors" title="Undo"><Undo size={16} /></button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="p-1.5 rounded hover:text-slate-900 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors" title="Redo"><Redo size={16} /></button>
      </div>

      {/* Bubble Menu removed as it is now in the main toolbar */}

      {/* Editor Canvas */}
      <div className="p-8 sm:p-12 min-h-[600px] cursor-text [&_.is-editor-empty:first-child::before]:text-slate-400 [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:pointer-events-none [&_.is-editor-empty:first-child::before]:h-0 [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:tracking-tight [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:tracking-tight [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:tracking-tight [&_p]:mb-4 [&_p]:text-slate-700 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_ul]:text-slate-700 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6 [&_ol]:text-slate-700 [&_ol]:space-y-2 [&_a]:text-primary [&_a]:underline focus-visible:outline-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

export default function PrivacyCMSPage() {
  const [data, setData] = useState<any>({
    heroImage: '',
    heroTitle: '', heroTitle_en: '', heroTitleWeight: '800',
    heroSubtitle: '', heroSubtitle_en: '', heroSubtitleWeight: '500',
    privacyContent: '', privacyContent_en: '',
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [activeTab, setActiveTab] = useState<'id' | 'en'>('id')
  const [isScrolled, setIsScrolled] = useState(false)
  const topHeaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = topHeaderRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      setIsScrolled(!entry.isIntersecting)
    }, { threshold: 0.1 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [fetching])

  useEffect(() => {
    fetch('/api/settings/privacy')
      .then(res => res.json())
      .then(res => {
        if (!res.error) {
          setData((prev: any) => ({ ...prev, ...res }))
        }
        setFetching(false)
      })
      .catch(() => {
        setFetching(false)
        toast.error('Gagal memuat data')
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/settings/privacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        toast.success('Konten berhasil diperbarui!')
      } else {
        toast.error('Gagal menyimpan.')
      }
    } catch {
      toast.error('Terjadi kesalahan koneksi.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuillChange = (value: string, activeFieldName: string) => {
    setData((prev: any) => ({ ...prev, [activeFieldName]: value }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setData((prev: any) => ({ ...prev, [name]: value }))
  }

  const renderLivePreview = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*[^*]+\*)/g);
    return (
      <>
        {parts.map((part, idx) => {
          if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
            const innerText = part.slice(1, -1);
            return (
              <span 
                key={idx} 
                className="inline-block font-extrabold px-1.5 py-0.5 mx-0.5 rounded bg-amber-400/20 text-[#FFC704] border border-[#FFC704]/40 shadow-[0_0_12px_rgba(255,199,4,0.25)] transition-all duration-300 transform scale-[1.02]"
              >
                {innerText}
              </span>
            );
          }
          return <span key={idx} className="text-slate-100">{part}</span>;
        })}
      </>
    );
  };

  const renderImageInput = (label: string, fieldName: string, placeholder = '', resolutionHint = '') => {
    const activeFieldName = fieldName; 
    return (
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          {label}
        </Label>
        {resolutionHint && (
          <p className="text-[11px] text-muted-foreground mt-0 mb-2 font-medium italic">
            💡 Resolusi yang disarankan: <span className="font-bold text-slate-700">{resolutionHint}</span>
          </p>
        )}
        <MediaPicker 
          value={data[activeFieldName] || ''}
          onChange={(url) => setData((prev: any) => ({ ...prev, [activeFieldName]: url }))}
          label="Pilih Gambar"
          description={placeholder ? `Disarankan seperti: ${placeholder}` : undefined}
        />
      </div>
    )
  }

  const renderTextInput = (label: string, fieldName: string, isTextarea = false, placeholder = '', enableWeight = false, defaultWeight = "400") => {
    const activeFieldName = activeTab === 'en' ? `${fieldName}_en` : fieldName;
    const weightField = `${fieldName}Weight`;
    const selectedWeight = data[weightField] ? Number(data[weightField]) : undefined;
    const isTitleOrHighlight = label.includes('*') || label.toLowerCase().includes('kuning') || fieldName.includes('Title') || (data[activeFieldName] && String(data[activeFieldName]).includes('*'));

    return (
      <div className="space-y-3 p-3.5 rounded-xl border border-border/60 bg-muted/10 shadow-xs">
        <div className="space-y-2">
          <Label className="flex items-center justify-between gap-2 text-sm font-semibold">
            <span>{label}</span>
            <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
              {activeTab}
            </span>
          </Label>
          {isTextarea ? (
            <Textarea 
              name={activeFieldName} 
              value={data[activeFieldName] || ''} 
              onChange={handleChange} 
              placeholder={placeholder}
              rows={3}
              style={enableWeight && selectedWeight ? { fontWeight: selectedWeight } : undefined}
            />
          ) : (
            <Input 
              type="text" 
              name={activeFieldName} 
              value={data[activeFieldName] || ''} 
              onChange={handleChange} 
              placeholder={placeholder}
              style={enableWeight && selectedWeight ? { fontWeight: selectedWeight } : undefined}
            />
          )}
        </div>
        
        {isTitleOrHighlight && data[activeFieldName] && (
          <div className="relative mt-2 p-3 rounded-lg bg-slate-950 border border-slate-800/80 shadow-inner flex items-center justify-between gap-3 overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#FFC704] to-amber-600 rounded-l-lg opacity-80" />
            <div className="flex flex-col gap-1 w-full pl-1">
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FFC704]/10 text-[#FFC704] border border-[#FFC704]/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFC704] animate-pulse"></span>
                  Live Preview
                </span>
                {!String(data[activeFieldName]).includes('*') && (
                  <span className="text-[11px] text-slate-400 italic">
                    Tips: Apit kata dengan <code className="text-[#FFC704] bg-slate-900 px-1 py-0.5 rounded font-bold">*bintang*</code> untuk warna kuning
                  </span>
                )}
              </div>
              <div 
                className="text-base font-bold text-slate-100 mt-1 pl-1 pr-2 tracking-tight leading-relaxed break-words"
                style={enableWeight && selectedWeight ? { fontWeight: selectedWeight } : undefined}
              >
                {renderLivePreview(String(data[activeFieldName]))}
              </div>
            </div>
          </div>
        )}

        {enableWeight && (
          <div className="pt-2 border-t border-border/40">
            <FontWeightPicker
              value={data[weightField]}
              onChange={(val) => setData((prev: any) => ({ ...prev, [weightField]: val }))}
              defaultWeight={defaultWeight}
            />
          </div>
        )}
      </div>
    )
  }

  const renderTextareaInput = (label: string, fieldName: string) => {
    const activeFieldName = activeTab === 'en' ? `${fieldName}_en` : fieldName;
    return (
      <div className="space-y-2 border-0 bg-transparent mt-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <Label className="flex items-center gap-2 text-lg font-semibold text-slate-800">
            {label} 
            <span className="text-[10px] bg-slate-800 text-white px-2 py-0.5 rounded-full font-mono uppercase font-bold tracking-wider">{activeTab.toUpperCase()}</span>
          </Label>
        </div>
        <div className="mb-4">
          <TiptapEditor 
            value={data[activeFieldName] || ''}
            onChange={(val) => handleQuillChange(val, activeFieldName)}
          />
        </div>
      </div>
    )
  }

  if (fetching) {
    return (
      <div className="flex h-full min-h-[500px] w-full items-center justify-center">
        <AirplaneLoader size={48} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-4">
      <div ref={topHeaderRef} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">CMS Kebijakan Privasi</h2>
          <p className="text-muted-foreground text-sm mt-1">Kelola teks Kebijakan Privasi (Privacy Policy).</p>
        </div>
        <Button 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 font-semibold rounded-full px-6 shadow-xs cursor-pointer transition-all text-white"
          style={{ color: '#ffffff' }}
        >
          {loading ? <AirplaneLoader size={18} className="mr-2" /> : <Save size={18} className="mr-2" />}
          Simpan Perubahan
        </Button>
      </div>

      <div className="flex gap-2">
        <Button 
          type="button"
          variant={activeTab === 'id' ? 'default' : 'outline'}
          onClick={() => setActiveTab('id')}
          className="gap-2 rounded-full font-medium h-9 px-5 shadow-2xs text-xs sm:text-sm cursor-pointer"
        >
          <img src="/flags/id.png" alt="ID" width={20} height={15} className="rounded-xs object-cover" /> 
          Indonesia
        </Button>
        <Button 
          type="button"
          variant={activeTab === 'en' ? 'default' : 'outline'}
          onClick={() => setActiveTab('en')}
          className="gap-2 rounded-full font-medium h-9 px-5 shadow-2xs text-xs sm:text-sm cursor-pointer"
        >
          <img src="/flags/en.png" alt="EN" width={20} height={15} className="rounded-xs object-cover" /> 
          English
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pt-4">
        
        {/* Hero Section (6col-6col Layout) */}
        <Card className="border-0 shadow-sm ring-1 ring-slate-100 bg-white/50 overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-bold text-slate-800">Hero Section (Header)</CardTitle>
            <CardDescription>Sesuaikan gambar latar, judul, dan deskripsi utama.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                {renderImageInput('URL Gambar Background', 'heroImage', '/hero-coastal.webp', '1920x1080 px (Landscape)')}
              </div>
              <div className="space-y-4 flex flex-col justify-start">
                {renderTextInput('Judul Utama (Gunakan *teks* untuk warna kuning)', 'heroTitle', false, '', true, '800')}
                {renderTextInput('Deskripsi', 'heroSubtitle', true, '', true, '500')}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Section */}
        <Card className="border-0 shadow-sm ring-1 ring-slate-100 bg-white/50">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-bold text-slate-800">Isi Dokumen</CardTitle>
            <CardDescription>Gunakan editor teks di bawah untuk menyusun format dokumen Anda.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {renderTextareaInput('Dokumen Kebijakan Privasi', 'privacyContent')}
          </CardContent>
        </Card>

      </form>

      {/* Apple / macOS-style Frosted Glass Floating Pill Dock */}
      <div 
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-full bg-white/75 dark:bg-zinc-900/75 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/60 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/5 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.18)] transition-all duration-300 max-w-[95vw] overflow-x-auto no-scrollbar ${
          isScrolled ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-12 opacity-0 pointer-events-none'
        }`}
      >
        {/* Language Segmented Toggle Container */}
        <div className="flex items-center gap-1 bg-black/[0.05] dark:bg-white/[0.08] p-1 rounded-full border border-black/[0.04] dark:border-white/[0.06]">
          <button
            type="button"
            onClick={() => setActiveTab('id')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer select-none ${
              activeTab === 'id' 
                ? 'bg-white dark:bg-zinc-800 text-foreground font-bold shadow-sm ring-1 ring-black/5' 
                : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            <img src="/flags/id.png" alt="ID" width={16} height={12} className="rounded-2xs object-cover shrink-0" />
            <span>ID</span>
            <span className="hidden sm:inline">Indonesia</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('en')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer select-none ${
              activeTab === 'en' 
                ? 'bg-white dark:bg-zinc-800 text-foreground font-bold shadow-sm ring-1 ring-black/5' 
                : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            <img src="/flags/en.png" alt="EN" width={16} height={12} className="rounded-2xs object-cover shrink-0" />
            <span>EN</span>
            <span className="hidden sm:inline">English</span>
          </button>
        </div>

        {/* Separator */}
        <div className="w-[1px] h-6 bg-black/10 dark:bg-white/10 shrink-0 my-auto hidden sm:block" />

        {/* Action Trigger */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-bold bg-primary hover:bg-primary/90 text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          style={{ color: '#ffffff' }}
        >
          {loading ? (
            <AirplaneLoader size={16} className="text-white shrink-0 animate-spin" />
          ) : (
            <Save size={16} className="shrink-0" />
          )}
          <span>Simpan Perubahan</span>
        </button>
      </div>
    </div>
  )
}
