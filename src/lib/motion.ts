export const motionDurations = {
  instant: 0.08,
  fast: 0.16,
  control: 0.24,
  copy: 0.52,
  section: 0.65,
  media: 0.9,
  hero: 1.2,
} as const;

export const motionEasings = {
  enter: [0.22, 1, 0.36, 1],
  standard: [0.4, 0, 0.2, 1],
  cinematic: [0.625, 0.05, 0, 1],
  exit: [0.4, 0, 1, 1],
} as const;
