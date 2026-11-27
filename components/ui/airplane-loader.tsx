"use client"

import { useEffect, useRef } from "react"
import AirplaneIcon from "./airplane-icon"
import type { AnimatedIconHandle } from "./types"

export default function AirplaneLoader({ size = 24, className = "" }: { size?: number; className?: string }) {
  const iconRef = useRef<AnimatedIconHandle>(null)

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    let restartId: ReturnType<typeof setTimeout> | undefined

    const playAnimation = () => {
      iconRef.current?.startAnimation()
      // Airplane animation takes about 0.8s + 0.3s for wind.
      // Replay every 1.5s
      timeoutId = setTimeout(() => {
        iconRef.current?.stopAnimation()
        restartId = setTimeout(playAnimation, 400)
      }, 1100)
    }

    playAnimation()

    // Saat unmount cukup hentikan jadwal ulang. JANGAN panggil stopAnimation di
    // sini: elemen ikon sudah dilepas, animate() motion akan error (scope null).
    return () => {
      clearTimeout(timeoutId)
      clearTimeout(restartId)
    }
  }, [])

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <AirplaneIcon ref={iconRef} size={size} className="text-primary" />
    </div>
  )
}
