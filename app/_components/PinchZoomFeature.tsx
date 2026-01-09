import Title from "@/ui/components/Title";
import React, { useEffect, useRef } from "react";
import { BiMinus } from "react-icons/bi";
import { PiPlus } from "react-icons/pi";
import { TbReload } from "react-icons/tb";

// Constants for easy configuration
const MIN_SCALE = 0.05;
const MAX_SCALE = 1.5;

function PinchZoomWrapper(props: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // We store the state in a ref to avoid re-renders on every frame
  const state = useRef({
    scale: 1,
    initialDist: 0,
    initialScale: 1,
  });

  // --- Helper: Apply the transform directly to DOM ---
  const updateTransform = () => {
    if (contentRef.current) {
      contentRef.current.style.transform = `scale(${state.current.scale})`;
      if (state.current.scale === 1) {
        contentRef.current.className = "w-full max-h-screen overflow-auto";
      } else contentRef.current.className = "";
    }
  };

  // --- Helper: Centralized Zoom Logic ---
  const applyZoom = (factor: number) => {
    state.current.scale *= factor;
    // Clamp: Ensure we never scale below 0.05 or above 1.5
    state.current.scale = Math.min(Math.max(MIN_SCALE, state.current.scale), MAX_SCALE);
    updateTransform();
  };

  // --- Button Handlers ---
  const handleZoomIn = () => applyZoom(1.2); // +20%
  const handleZoomOut = () => applyZoom(0.8); // -20%
  const handleReset = () => {
    state.current.scale = 1;
    updateTransform();
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Gesture: Wheel (Trackpad/Mouse) ---
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = -e.deltaY;
        // If scrolling up (delta > 0), zoom in. Else zoom out.
        const factor = delta > 0 ? 1.05 : 0.95;
        applyZoom(factor);
      }
    };

    // --- Gesture: Touch Pinch ---
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        state.current.initialDist = Math.hypot(
          touch1.pageX - touch2.pageX,
          touch1.pageY - touch2.pageY
        );
        state.current.initialScale = state.current.scale;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDist = Math.hypot(touch1.pageX - touch2.pageX, touch1.pageY - touch2.pageY);

        if (state.current.initialDist > 0) {
          const distChange = currentDist / state.current.initialDist;
          let newScale = state.current.initialScale * distChange;

          // Enforce Limits
          newScale = Math.min(Math.max(MIN_SCALE, newScale), MAX_SCALE);

          state.current.scale = newScale;
          updateTransform();
        }
      }
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("touchstart", onTouchStart, { passive: false });
    container.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={containerStyles}
      className="relative h-full w-full overflow-auto"
    >
      {/* Toolbar for Manual Zoom */}
      <div className="fixed right-2 bottom-2 z-10 flex gap-2">
        <Title title="Zoom In">
          <button onClick={handleZoomIn} className="cursor-pointer rounded bg-white/80 px-2 py-2">
            <PiPlus size={14} />
          </button>
        </Title>
        <Title title="Zoom Out">
          <button onClick={handleZoomOut} className="cursor-pointer rounded bg-white/80 px-2 py-2">
            <BiMinus size={14} />
          </button>
        </Title>
        <Title title="Reset Zoom">
          <button onClick={handleReset} className="cursor-pointer rounded bg-white/80 px-3 py-2">
            <TbReload size={14} />
          </button>
        </Title>
      </div>

      <div
        ref={contentRef}
        style={contentStyles}
        className={`h-full max-h-screen w-full overflow-auto`}
      >
        {props.children}
      </div>
    </div>
  );
}

// --- Styles ---

const containerStyles: React.CSSProperties = {
  touchAction: "none",
};

const contentStyles: React.CSSProperties = {
  transformOrigin: "0 0",
  transition: "transform 0.1s ease-out",
};

export default PinchZoomWrapper;
