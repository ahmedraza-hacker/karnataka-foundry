"use client";

import { useEffect, useRef, useState } from "react";
import {
  getAverageVideoLuminance,
  getVideoContrastTheme,
  type VideoContrastTheme,
} from "@/lib/video-contrast";

export function SiteBackgroundVideo() {
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setMotionAllowed(!preference.matches);

    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.videoTheme = "dark";
    if (!motionAllowed || videoFailed) return;

    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 9;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      console.warn("Background video brightness sampling is unavailable; using dark text contrast.");
      return;
    }

    let theme: VideoContrastTheme = "dark";
    let samplingFailed = false;
    const sampleBrightness = () => {
      if (samplingFailed || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;

      try {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        theme = getVideoContrastTheme(getAverageVideoLuminance(pixels), theme);
        root.dataset.videoTheme = theme;
      } catch (error) {
        samplingFailed = true;
        theme = "dark";
        root.dataset.videoTheme = theme;
        console.warn("Unable to sample background video brightness; using dark text contrast.", error);
      }
    };

    video.addEventListener("loadeddata", sampleBrightness);
    const intervalId = window.setInterval(sampleBrightness, 1200);
    return () => {
      video.removeEventListener("loadeddata", sampleBrightness);
      window.clearInterval(intervalId);
    };
  }, [motionAllowed, videoFailed]);

  if (!motionAllowed || videoFailed) return null;

  return (
    <div className="site-background-video" aria-hidden="true">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onError={() => {
          document.documentElement.dataset.videoTheme = "dark";
          setVideoFailed(true);
        }}
      >
        <source src="/videos/acmotorcooling.mp4" type="video/mp4" />
      </video>
      <div className="site-background-video-shade" />
    </div>
  );
}
