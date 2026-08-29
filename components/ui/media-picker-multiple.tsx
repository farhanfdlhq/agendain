"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { ImageIcon, UploadCloud, X, CheckCircle2, Trash2 } from "lucide-react"
import { toast } from "react-hot-toast"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AirplaneLoader from "@/components/ui/airplane-loader"
import { Label } from "@/components/ui/label"
import { useConfirm } from "@/components/Providers/ConfirmProvider"

interface MediaPickerMultipleProps {
  values: string[]
  onChange: (urls: string[]) => void
  label?: string
  description?: string
}

export function MediaPickerMultiple({ values, onChange, label = "Klik untuk memilih banyak gambar", description = "Maks 10MB/file" }: MediaPickerMultipleProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")
  const [uploading, setUploading] = useState(false)
  const [mediaList, setMediaList] = useState<{ url: string, name: string }[]>([])
  const [loadingMedia, setLoadingMedia] = useState(false)
  const [deletingFile, setDeletingFile] = useState<string | null>(null)
  
  const { showConfirm } = useConfirm()

  const fetchMedia = async () => {
    setLoadingMedia(true)
    try {
      const res = await fetch("/api/upload")
      if (res.ok) {
        const data = await res.json()
        setMediaList(data.files || [])
      }
    } catch (err) {
      console.error("Gagal mengambil bank media", err)
    } finally {
      setLoadingMedia(false)
    }
  }

  useEffect(() => {
    if (open && activeTab === "bank") {
      fetchMedia()
    }
  }, [open, activeTab])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploading(true)
    
    try {
      const uploadedUrls: string[] = []
      
      for (const file of files) {
        const uploadData = new FormData()
        uploadData.append('file', file)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData,
        })
        const data = await res.json()
        if (res.ok) {
          uploadedUrls.push(data.url)
        } else {
          toast.error(`Gagal upload ${file.name}: ${data.error}`)
        }
      }
      
      if (uploadedUrls.length > 0) {
        onChange([...values, ...uploadedUrls])
        toast.success("Gambar berhasil diupload!")
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat upload gambar.")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (url: string, e: React.MouseEvent) => {
    e.stopPropagation() 
    
    showConfirm(
      "Konfirmasi Hapus Media",
      "Apakah Anda yakin ingin menghapus gambar ini secara permanen dari server?",
      async () => {
        setDeletingFile(url)
        try {
          const res = await fetch("/api/upload", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url })
          })
          
          if (res.ok) {
            toast.success("Gambar berhasil dihapus.")
            setMediaList(prev => prev.filter(m => m.url !== url))
            if (values.includes(url)) {
              onChange(values.filter(v => v !== url))
            }
          } else {
            const data = await res.json()
            toast.error("Gagal menghapus: " + data.error)
          }
        } catch (err) {
          toast.error("Terjadi kesalahan server saat menghapus.")
        } finally {
          setDeletingFile(null)
        }
      }
    )
  }

  const toggleSelectMedia = (url: string) => {
    if (values.includes(url)) {
      onChange(values.filter(v => v !== url))
    } else {
      onChange([...values, url])
    }
  }

  const removeImage = (index: number) => {
    onChange(values.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div 
        onClick={() => setOpen(true)}
        className="flex flex-col items-center justify-center w-full py-12 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors bg-muted/20"
      >
        <ImageIcon className="h-8 w-8 text-primary mb-2" />
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground mt-1">{description}</span>
      </div>

      {values.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          {values.map((url, idx) => (
            <div key={idx} className={`relative aspect-square rounded-lg overflow-hidden border ${idx === 0 ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}>
              <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
              {idx === 0 && (
                <div className="absolute bottom-0 inset-x-0 bg-background/80 backdrop-blur-sm text-[10px] font-medium text-center py-1">
                  Thumbnail
                </div>
              )}
              <Button 
                variant="destructive" 
                size="icon" 
                className="absolute top-1 right-1 h-6 w-6 rounded-full"
                onClick={() => removeImage(idx)}
                type="button"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[92dvh] p-0 overflow-hidden bg-background">
          <DialogHeader className="px-6 py-4 border-b border-border bg-muted/20">
            <DialogTitle className="text-xl">Bank Media</DialogTitle>
            <DialogDescription>
              Upload file baru atau pilih dari pustaka media yang sudah ada. Anda dapat memilih lebih dari satu.
            </DialogDescription>
          </DialogHeader>

          {/* Tinggi mengikuti viewport di mobile (dvh) agar isi tidak terpotong
              & footer "Selesai Memilih" tidak menutupi grid; dibatasi 500px di
              layar besar. Header dialog ikut diperhitungkan lewat max-h di atas. */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-[68dvh] max-h-[500px] flex flex-col">
            <div className="px-6 pt-4 border-b border-border">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="upload" className="font-medium">Upload Baru</TabsTrigger>
                <TabsTrigger value="bank" className="font-medium">Pilih dari Galeri</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="upload" className="flex-1 overflow-y-auto p-6 m-0 focus-visible:outline-none">
              <div className="border-2 border-dashed border-border rounded-2xl h-full flex flex-col items-center justify-center bg-muted/10 hover:bg-muted/30 transition-all cursor-pointer relative overflow-hidden group">
                <input 
                  type="file" 
                  accept="image/*"
                  multiple
                  onChange={handleUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={uploading}
                />
                
                {uploading ? (
                  <div className="flex flex-col items-center gap-4 text-primary">
                    <AirplaneLoader size={48} />
                    <p className="font-semibold animate-pulse">Mengupload gambar...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors transform group-hover:scale-105 duration-300">
                    <div className="bg-background shadow-sm border border-border p-4 rounded-full">
                      <UploadCloud size={32} className="text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-base mb-1">Tarik & Lepas gambar ke sini</p>
                      <p className="text-sm opacity-80">atau klik untuk menelusuri file</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="bank" className="flex-1 overflow-y-auto p-6 m-0 focus-visible:outline-none bg-muted/5 relative">
              {loadingMedia ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
                  <AirplaneLoader size={32} />
                  <p className="text-sm font-medium animate-pulse">Memuat bank media...</p>
                </div>
              ) : mediaList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
                  <ImageIcon size={48} className="opacity-20" />
                  <p className="text-sm font-medium">Belum ada gambar di galeri.</p>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("upload")}>Upload Sekarang</Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 pb-16">
                  {mediaList.map((media) => (
                    <div 
                      key={media.url}
                      onClick={() => toggleSelectMedia(media.url)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer group transition-all ${values.includes(media.url) ? 'border-primary ring-4 ring-primary/20 shadow-md' : 'border-transparent hover:border-primary/50 bg-background shadow-sm'}`}
                    >
                      <img src={media.url} alt={media.name} className="w-full h-full object-cover" loading="lazy" />
                      
                      {values.includes(media.url) && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5 shadow-sm">
                          <CheckCircle2 size={16} />
                        </div>
                      )}
                      
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6 opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-end">
                        <p className="text-[10px] text-white truncate pr-2" title={media.name}>{media.name}</p>
                        
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 rounded-full bg-destructive/80 hover:bg-destructive text-white shrink-0 shadow-sm"
                          onClick={(e) => handleDelete(media.url, e)}
                          disabled={deletingFile === media.url}
                        >
                          {deletingFile === media.url ? <AirplaneLoader size={10} /> : <Trash2 size={10} />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "bank" && (
                <div className="absolute bottom-0 inset-x-0 p-4 bg-background border-t shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] flex justify-end">
                  <Button onClick={() => setOpen(false)}>
                    Selesai Memilih ({values.length})
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}
