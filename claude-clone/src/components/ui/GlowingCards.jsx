import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

export const GlowingCard = ({
  children,
  className,
  glowColor = "#3b82f6",
  hoverEffect = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        "relative flex-1 min-w-[14rem] p-6 rounded-2xl text-black dark:text-white cursor-pointer",
        "bg-[var(--bg-secondary)] border border-[var(--border)]",
        "transition-all duration-400 ease-out",
        className
      )}
      style={{
        '--glow-color': glowColor,
      }}
      {...props}
    >
      <div className="relative z-20">
        {children}
      </div>
    </div>
  );
};

export const GlowingCards = ({
  children,
  className,
  enableGlow = true,
  glowRadius = 15,
  glowOpacity = 1,
  animationDuration = 400,
  enableHover = true,
  gap = "12px",
  maxWidth = "520px",
  padding = "0",
  backgroundColor,
  borderRadius = "1rem",
  responsive = true,
  customTheme,
}) => {
  const containerRef = useRef(null);
  const overlayRef = useRef(null);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const overlay = overlayRef.current;

    if (!container || !overlay || !enableGlow) return;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setShowOverlay(true);

      overlay.style.setProperty('--x', x + 'px');
      overlay.style.setProperty('--y', y + 'px');
      overlay.style.setProperty('--opacity', glowOpacity.toString());
    };

    const handleMouseLeave = () => {
      setShowOverlay(false);
      overlay.style.setProperty('--opacity', '0');
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enableGlow, glowOpacity]);

  const containerStyle = {
    '--gap': gap,
    '--max-width': maxWidth,
    '--padding': padding,
    '--border-radius': borderRadius,
    '--animation-duration': animationDuration + 'ms',
    '--glow-radius': glowRadius + 'rem',
    '--glow-opacity': glowOpacity,
    backgroundColor: backgroundColor || undefined,
    ...customTheme,
  };

  return (
    <div
      className={cn("relative w-full", className)}
      style={containerStyle}
    >
      <div
        ref={containerRef}
        className={cn(
          "relative max-w-[var(--max-width)] mx-auto ",
        )}
        style={{ padding: "var(--padding)" }}
      >
        <div
          className={cn(
            "flex items-center justify-center flex-wrap gap-[var(--gap)]",
            responsive && "flex-col sm:flex-row"
          )}
        >
          {children}
        </div>

        {enableGlow && (
          <div
            ref={overlayRef}
            className={cn(
              "absolute inset-0 pointer-events-none select-none",
              "opacity-0 transition-all duration-[var(--animation-duration)] ease-out"
            )}
            style={{
              WebkitMask:
                "radial-gradient(var(--glow-radius) var(--glow-radius) at var(--x, 0) var(--y, 0), #000 1%, transparent 50%)",
              mask:
                "radial-gradient(var(--glow-radius) var(--glow-radius) at var(--x, 0) var(--y, 0), #000 1%, transparent 50%)",
              opacity: showOverlay ? 'var(--opacity)' : '0',
            }}
          >
            <div
              className={cn(
                "flex items-center justify-center flex-wrap gap-[var(--gap)] max-w-[var(--max-width)] center mx-auto",
                responsive && "flex-col sm:flex-row"
              )}
              style={{ padding: "var(--padding)" }}
            >
              {React.Children.map(children, (child) => {
                if (React.isValidElement(child) && child.type === GlowingCard) {
                  const cardGlowColor = child.props.glowColor || "#3b82f6";
                  return React.cloneElement(child, {
                    className: cn(
                      child.props.className,
                      "bg-opacity-20 dark:bg-opacity-20"
                    ),
                    style: {
                      ...child.props.style,
                      backgroundColor: cardGlowColor + "20",
                      borderColor: cardGlowColor,
                      boxShadow: "0 0 15px " + cardGlowColor + "40",
                    },
                  });
                }
                return child;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlowingCards;
