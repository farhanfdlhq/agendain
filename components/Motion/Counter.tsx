"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

interface CounterProps {
  value: number;
  suffix?: string;
  duration?: number; // in seconds
}

export default function Counter({ value, suffix = "", duration = 2 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const format = (n: number) => Intl.NumberFormat("en-US").format(Math.floor(n));

  // Mulai dari ~60% nilai final, BUKAN 0. Sebelum masuk viewport (mis. stats di
  // bawah lipatan), angka tetap terlihat wajar — bukan "0+ 0+ 0K+" yang terkesan
  // kosong/rusak. Count-up tetap menghidupkan saat blok terlihat.
  const floor = Math.max(0, Math.round(value * 0.6));

  const [displayValue, setDisplayValue] = useState(() => format(floor));

  const motionValue = useMotionValue(floor);
  const springValue = useSpring(motionValue, {
    duration: duration * 1000,
    bounce: 0,
  });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    const unsub = springValue.on("change", (latest) => {
      setDisplayValue(format(latest));
    });
    return () => unsub();
  }, [springValue]);

  return (
    <span ref={ref}>
      {displayValue}
      {suffix}
    </span>
  );
}
