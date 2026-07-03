"use client";

import { Bell } from "lucide-react";
import { motion, useAnimate } from "motion/react";
import { forwardRef, useCallback } from "react";

interface AnimatedBellProps {
  size?: number | string;
  className?: string;
  hasNotification?: boolean;
}

const AnimatedBell = forwardRef<HTMLDivElement, AnimatedBellProps>(
  ({ size = 24, className = "", hasNotification = true }, ref) => {
    const [scope, animate] = useAnimate();

    const start = useCallback(() => {
      animate(
        scope.current,
        { rotate: [0, -15, 15, -15, 15, 0] },
        { duration: 0.5, ease: "easeInOut" }
      );
    }, [animate, scope]);

    return (
      <div 
        ref={scope} 
        onMouseEnter={start}
        className={`relative inline-flex items-center justify-center cursor-pointer ${className}`}
      >
        <Bell size={size} className="text-muted-foreground" />
        {hasNotification && (
          <span className="absolute top-0 right-0.5 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-background" />
        )}
      </div>
    );
  }
);

AnimatedBell.displayName = "AnimatedBell";
export default AnimatedBell;
