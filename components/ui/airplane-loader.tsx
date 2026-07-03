"use client"

import { useEffect, useRef } from "react"
import AirplaneIcon from "./airplane-icon"
import type { AnimatedIconHandle } from "./types"

export default function AirplaneLoader({ size = 24, className = "" }: { size?: number; className?: string }) {
  const iconRef = useRef<AnimatedIconHandle>(null)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const playAnimation = () => {
      iconRef.current?.startAnimation()
      // Airplane animation takes about 0.8s + 0.3s for wind.
      // Replay every 1.5s
      timeoutId = setTimeout(() => {
        iconRef.current?.stopAnimation()
        setTimeout(playAnimation, 400)
      }, 1100)
    }

    playAnimation()

    return () => {
      clearTimeout(timeoutId)
      iconRef.current?.stopAnimation()
    }
  }, [])

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <AirplaneIcon ref={iconRef} size={size} className="text-primary" />
    </div>
  )
}
