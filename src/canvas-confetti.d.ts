declare module "canvas-confetti" {
  interface Options {
    particleCount?: number;
    angle?: number;
    spread?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
    scalar?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
  }
  function confetti(options?: Options): Promise<null>;
  export default confetti;
}
