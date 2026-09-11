"use client";
import { motion, useInView, useReducedMotion, Variants } from "framer-motion";
import { useRef } from "react";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
  duration?: number;
}

export default function FadeIn({
  children,
  delay = 0,
  direction = "up",
  className = "",
  duration = 0.6,
}: FadeInProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const reduce = useReducedMotion();

  // Hormati prefers-reduced-motion: tampilkan isi langsung tanpa gerak apa pun
  // (bukan sekadar mempercepat). Konten tetap terlihat walau animasi dimatikan.
  if (reduce) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  const getVariants = (): Variants => {
    switch (direction) {
      case "up":
        return { hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0 } };
      case "down":
        return {
          hidden: { opacity: 0, y: -25 },
          visible: { opacity: 1, y: 0 },
        };
      case "left":
        return { hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } };
      case "right":
        return {
          hidden: { opacity: 0, x: -20 },
          visible: { opacity: 1, x: 0 },
        };
      case "none":
        return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
    }
  };

  return (
    <motion.div
      ref={ref}
      variants={getVariants()}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
