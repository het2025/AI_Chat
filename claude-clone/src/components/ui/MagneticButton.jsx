import React, { useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { cn } from "../../lib/utils";

/**
 * MagneticButton Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button label or children
 * @param {number} [props.strength=0.4] - How strongly the button attracts (0–1)
 * @param {number} [props.radius=80] - Pixel radius in which magnetism activates
 * @param {string} [props.variant="primary"] - Visual variant
 * @param {string} [props.size="md"] - Size preset
 * @param {function} [props.onClick] - onClick handler
 * @param {string} [props.className] - Additional classes
 * @param {boolean} [props.disabled] - Disabled state
 * @param {Object} [props.style] - Inline styles for the button
 */
export function MagneticButton({
  children,
  strength = 0.4,
  radius = 60,
  variant = "primary",
  size = "md",
  onClick,
  className,
  disabled = false,
  style = {},
  ...props
}) {
  const buttonRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const springConfig = { stiffness: 200, damping: 18, mass: 0.6 };

  const rawX = useSpring(0, springConfig);
  const rawY = useSpring(0, springConfig);

  const textX = useTransform(rawX, (v) => v * 0.4);
  const textY = useTransform(rawY, (v) => v * 0.4);

  const handleMouseMove = (e) => {
    if (disabled) return;
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;
    const dist = Math.sqrt(distX ** 2 + distY ** 2);

    if (dist < radius) {
      rawX.set(distX * strength);
      rawY.set(distY * strength);
      setIsHovered(true);
    } else {
      rawX.set(0);
      rawY.set(0);
      setIsHovered(false);
    }
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
    setIsHovered(false);
  };

  const variants = {
    primary: "bg-[#D97757] text-white shadow-lg shadow-[#D97757]/20",
    outline: "border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]",
    ghost: "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]",
    dark: "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-md",
    none: ""
  };

  const sizes = {
    sm: "h-9 px-4 text-sm rounded-full",
    md: "h-12 px-8 text-base rounded-full",
    lg: "h-14 px-12 text-lg rounded-full",
    none: ""
  };

  return (
    <div
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-flex items-center justify-center transition-transform"
      style={{ 
        padding: isHovered ? radius * 0.15 : 0,
        margin: isHovered ? -(radius * 0.15) : 0 
      }}
    >
      <motion.button
        type="button"
        onClick={onClick}
        disabled={disabled}
        style={{ x: rawX, y: rawY, ...style }}
        animate={{ scale: isHovered && !disabled ? 1.05 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={cn(
          "relative inline-flex items-center justify-center font-semibold focus-visible:outline-none transition-colors",
          variant !== "none" && variants[variant],
          size !== "none" && sizes[size],
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        <motion.span
          animate={{ opacity: isHovered && !disabled ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-white/10"
        />

        <motion.span
          style={{ x: textX, y: textY }}
          className="relative z-10 flex items-center justify-center w-full h-full"
        >
          {children}
        </motion.span>
      </motion.button>
    </div>
  );
}
