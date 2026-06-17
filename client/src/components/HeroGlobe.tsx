import { Suspense, lazy, useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

// Code-split the Three.js scene out of the initial bundle. It is only ever
// imported once the guards below decide the globe should actually render.
const HeroGlobeScene = lazy(() => import("./HeroGlobeScene"));

/** Cheap WebGL capability probe. Returns false in jsdom (so tests render the fallback). */
function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return (
      !!window.WebGLRenderingContext &&
      !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

/**
 * Renders the rotating dot globe when the environment can handle it. Degrades
 * to nothing (the surrounding aurora glows carry the visual) when motion is
 * reduced, WebGL is unavailable, or during the test environment.
 */
export function HeroGlobe() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!reduce && supportsWebGL()) setEnabled(true);
  }, [reduce]);

  if (!enabled) return null;

  return (
    <Suspense fallback={null}>
      <HeroGlobeScene />
    </Suspense>
  );
}
