import React, { useRef, useEffect } from "react";

interface TiltProps {
  children: React.ReactNode;
  className?: string;
  /** maximum rotation in degrees */
  maxTilt?: number;
  /** perspective in px */
  perspective?: number;
  /** scale on hover */
  scale?: number;
  /** transition duration ms */
  transition?: number;
  /** disable tilt when true */
  enabled?: boolean;
}

export const Tilt: React.FC<TiltProps> = ({
  children,
  className = "",
  maxTilt = 12,
  perspective = 900,
  scale = 1.02,
  transition = 160,
  enabled = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const inner = innerRef.current;
  if (!container || !inner) return;

  // Auto-disable tilt for tables (data rows) or when explicitly disabled via class
  const containsTable = !!container.querySelector("table");
  const hasNoTiltClass = container.classList.contains("no-tilt") || className.includes("no-tilt");
  if (!enabled || containsTable || hasNoTiltClass) return;

    // Respect user preference for reduced motion
    const reduces =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduces) return;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      const dx = (x - cx) / cx; // -1 .. 1
      const dy = (y - cy) / cy; // -1 .. 1

      const rotateY = dx * maxTilt; // horizontal movement -> rotateY
      const rotateX = -dy * maxTilt; // vertical movement -> rotateX

      inner.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
      inner.style.transition = `transform ${transition}ms cubic-bezier(.2,.8,.2,1)`;
      inner.style.transformStyle = "preserve-3d";
    };

    const handlePointerLeave = () => {
      inner.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)`;
      inner.style.transition = `transform ${transition}ms cubic-bezier(.2,.8,.2,1)`;
    };

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);
    container.addEventListener("pointercancel", handlePointerLeave);

    return () => {
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
      container.removeEventListener("pointercancel", handlePointerLeave);
    };
  }, [maxTilt, perspective, scale, transition]);

  return (
    <div
      ref={containerRef}
      className={`tilt-container relative ${className}`}
      style={{ perspective: `${perspective}px` }}
    >
      <div ref={innerRef} className="tilt-inner will-change-transform">
        {children}
      </div>
      {/* styles are applied dynamically and via utility classes; prefers-reduced-motion is honored in JS */}
    </div>
  );
};

export default Tilt;
