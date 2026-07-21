"use client"

import { useState, useEffect } from 'react'
import { WifiOff, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function OfflineDetector() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    if (!navigator.onLine) {
      setIsOffline(true)
    }

    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          style={{
            position: 'fixed', top: '1rem', left: '50%', transform: 'translateX(-50%)', zIndex: 1000,
            display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.95)',
            backdropFilter: 'blur(8px)', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: '1rem',
            boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.3)', border: '1px solid rgba(239, 68, 68, 0.5)',
            fontFamily: 'var(--font-body, system-ui, sans-serif)'
          }}
        >
          <WifiOff size={20} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Koneksi Terputus</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>Periksa jaringan internet Anda</span>
          </div>
          <button 
            onClick={() => setIsOffline(false)} 
            style={{ marginLeft: '0.5rem', padding: '0.25rem', background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', borderRadius: '50%', display: 'flex' }}
            aria-label="Tutup"
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
