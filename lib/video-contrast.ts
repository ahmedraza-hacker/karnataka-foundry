export type VideoContrastTheme = "dark" | "light";

const DARK_TO_LIGHT_THRESHOLD = 0.58;
const LIGHT_TO_DARK_THRESHOLD = 0.42;

export function getVideoContrastTheme(
  luminance: number,
  currentTheme: VideoContrastTheme,
): VideoContrastTheme {
  if (!Number.isFinite(luminance)) return "dark";
  if (currentTheme === "dark" && luminance >= DARK_TO_LIGHT_THRESHOLD) return "light";
  if (currentTheme === "light" && luminance <= LIGHT_TO_DARK_THRESHOLD) return "dark";
  return currentTheme;
}

export function getAverageVideoLuminance(pixels: Uint8ClampedArray): number {
  if (pixels.length < 4 || pixels.length % 4 !== 0) return Number.NaN;

  let total = 0;
  const pixelCount = pixels.length / 4;
  for (let index = 0; index < pixels.length; index += 4) {
    total += (
      pixels[index] * 0.2126 +
      pixels[index + 1] * 0.7152 +
      pixels[index + 2] * 0.0722
    ) / 255;
  }
  return total / pixelCount;
}
