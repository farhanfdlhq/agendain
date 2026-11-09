"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

interface CounterProps {
  value: number;
  suffix?: string;
  duration?: number; // in seconds
}

const format = (n: number) => Intl.NumberFormat("en-US").format(Math.floor(n));

/**
 * Angka statistik dengan efek hitung naik.
 *
 * HTML awal (server) berisi NILAI AKHIR, mis. "94%", supaya Google, pratinjau
 * link, dan pembaca tanpa JavaScript membaca angka yang benar. Dulu render awal
 * 60% nilai ("56%"), dan angka itu yang tertangkap crawler. Saat blok masuk
 * layar, angka sekilas kembali ke 0 lalu dihitung naik ke nilai akhir.
 * Pengguna "kurangi animasi" langsung melihat nilai akhir tanpa hitungan.
 */
export default function Counter({ value, suffix = "", duration = 2 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const reduceMotion = useReducedMotion();
  // null = belum/tidak dianimasikan → tampilkan nilai akhir.
  const [animated, setAnimated] = useState<number | null>(null);

  useEffect(() => {
    if (!isInView || reduceMotion) return;
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => setAnimated(latest),
    });
    return () => controls.stop();
  }, [isInView, reduceMotion, value, duration]);

  return (
    <span ref={ref}>
      {format(animated ?? value)}
      {suffix}
    </span>
  );
}
