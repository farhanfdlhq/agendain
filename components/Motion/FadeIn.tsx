"use client";
import { motion, useInView, Variants } from "framer-motion";
import { useRef } from "react";
import { useBelowFoldReveal } from "./useBelowFoldReveal";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
  duration?: number;
}

const OFFSETS = {
  up: { y: 25 },
  down: { y: -25 },
  left: { x: 20 },
  right: { x: -20 },
  none: {},
} as const;

export default function FadeIn({
  children,
  delay = 0,
  direction = "up",
  className = "",
  duration = 0.6,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  // Server & layar pertama: langsung terlihat. Reduced-motion: tak pernah bergerak.
  const animateIn = useBelowFoldReveal(ref);

  const variants: Variants = {
    // Disembunyikan seketika (elemen masih di luar layar), muncul dengan transisi.
    hidden: { opacity: 0, ...OFFSETS[direction], transition: { duration: 0 } },
    visible: { opacity: 1, x: 0, y: 0, transition: { duration, delay, ease: "easeOut" } },
  };

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial={false}
      animate={!animateIn || isInView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}
