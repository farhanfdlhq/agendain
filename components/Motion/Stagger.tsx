"use client"
import { motion, useInView, Variants } from "framer-motion"
import { useRef } from "react"
import React from "react"

interface StaggerProps {
  children: React.ReactNode
  staggerDelay?: number
  className?: string
}

export default function Stagger({ children, staggerDelay = 0.1, className = "" }: StaggerProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-10%" })

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay
      }
    }
  }

  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  }

  const childrenArray = React.Children.toArray(children)

  return (
    <motion.div
      ref={ref}
      variants={container}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {childrenArray.map((child, index) => (
        <motion.div key={index} variants={item}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
