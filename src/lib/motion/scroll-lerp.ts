// src/lib/motion/scroll-lerp.ts

/**
 * Scroll Velocity Lerp
 *
 * Smooths scroll velocity so animations don't jerk on start/stop.
 * Uses different lerp factors for acceleration vs deceleration
 * to create a natural feel.
 */

interface ScrollLerpState {
  currentVelocity: number;
  targetVelocity: number;
  smoothedProgress: number;
}

const LERP_FACTORS = {
  // How quickly velocity ramps up when scroll starts
  accelerate: 0.12,

  // How quickly velocity decays when scroll stops
  decelerate: 0.08,
} as const;

// Threshold below which we consider velocity "stopped"
const VELOCITY_THRESHOLD = 0.01;
const SETTLING_THRESHOLD = 0.001;

export interface ScrollLerpResult {
  progress: number;
  velocity: number;
  isSettling: boolean;
}

export interface ScrollLerp {
  update: (rawProgress: number, rawVelocity: number) => ScrollLerpResult;
  reset: () => void;
  getState: () => Readonly<ScrollLerpState>;
}

/**
 * Create a scroll lerp instance
 * Call update() on each scroll event with raw progress and velocity
 */
export function createScrollLerp(): ScrollLerp {
  let state: ScrollLerpState = {
    currentVelocity: 0,
    targetVelocity: 0,
    smoothedProgress: 0,
  };

  return {
    update(rawProgress: number, rawVelocity: number): ScrollLerpResult {
      state.targetVelocity = rawVelocity;

      // Lerp toward target velocity with different factors for accel/decel
      const lerpFactor = Math.abs(rawVelocity) > Math.abs(state.currentVelocity)
        ? LERP_FACTORS.accelerate
        : LERP_FACTORS.decelerate;

      state.currentVelocity += (state.targetVelocity - state.currentVelocity) * lerpFactor;

      // Apply smoothed velocity to progress
      state.smoothedProgress = rawProgress;

      // Check if we're settling (target stopped but current still moving)
      const isSettling =
        Math.abs(state.targetVelocity) < VELOCITY_THRESHOLD &&
        Math.abs(state.currentVelocity) > SETTLING_THRESHOLD;

      return {
        progress: state.smoothedProgress,
        velocity: state.currentVelocity,
        isSettling,
      };
    },

    reset() {
      state = {
        currentVelocity: 0,
        targetVelocity: 0,
        smoothedProgress: 0,
      };
    },

    getState() {
      return { ...state };
    },
  };
}
