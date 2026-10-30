import assert from "node:assert/strict";
import test from "node:test";
import {
  getAverageVideoLuminance,
  getVideoContrastTheme,
} from "@/lib/video-contrast";

test("video contrast changes themes only after crossing hysteresis thresholds", () => {
  assert.equal(getVideoContrastTheme(0.58, "dark"), "light");
  assert.equal(getVideoContrastTheme(0.5, "dark"), "dark");
  assert.equal(getVideoContrastTheme(0.42, "light"), "dark");
  assert.equal(getVideoContrastTheme(0.5, "light"), "light");
});

test("invalid luminance selects the safe dark theme", () => {
  assert.equal(getVideoContrastTheme(Number.NaN, "light"), "dark");
});

test("average video luminance uses perceptual RGB weights", () => {
  assert.ok(
    Math.abs(getAverageVideoLuminance(new Uint8ClampedArray([255, 255, 255, 255])) - 1) < 0.000001,
  );
  assert.equal(getAverageVideoLuminance(new Uint8ClampedArray([0, 0, 0, 255])), 0);
  assert.ok(Number.isNaN(getAverageVideoLuminance(new Uint8ClampedArray([]))));
});
