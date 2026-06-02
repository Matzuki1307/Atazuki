import { useEffect } from "react";

export function useMediaSession({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrevious,
  onSeekForward,
  onSeekBackward,
}) {
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack?.title || "",
      artist: currentTrack?.artist || "",
      artwork: currentTrack?.art
        ? [{ src: currentTrack.art, sizes: "320x180", type: "image/jpeg" }]
        : [],
    });
  }, [currentTrack]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.setActionHandler("play", () => onTogglePlay?.());
    navigator.mediaSession.setActionHandler("pause", () => onTogglePlay?.());
    navigator.mediaSession.setActionHandler("previoustrack", () => onPrevious?.());
    navigator.mediaSession.setActionHandler("nexttrack", () => onNext?.());
    navigator.mediaSession.setActionHandler("seekforward", () => onSeekForward?.());
    navigator.mediaSession.setActionHandler("seekbackward", () => onSeekBackward?.());

    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("previoustrack", null);
      navigator.mediaSession.setActionHandler("nexttrack", null);
      navigator.mediaSession.setActionHandler("seekforward", null);
      navigator.mediaSession.setActionHandler("seekbackward", null);
    };
  }, [onTogglePlay, onPrevious, onNext, onSeekForward, onSeekBackward]);
}
