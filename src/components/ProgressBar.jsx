import { memo } from "react";
import { SCALE, PROGRESS_TRACK_WIDTH, MADKAT_SIZE } from "../constants";
import progressBar from "../assets/Atapaz/ProgressBar.png";
import madkat from "../assets/Atapaz/Madkat.png";

const ProgressBar = memo(function ProgressBar({
  progress,
  currentTime,
  duration,
  progressColor,
  onSeek,
  formatTime,
}) {
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 410 * SCALE,
          left: 27 * SCALE,
          width: 238 * SCALE,
          display: "flex",
          justifyContent: "space-between",
          color: progressColor,
          fontFamily: "monospace",
          fontSize: `${8 * SCALE}px`,
          zIndex: 6,
        }}
      >
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      <div
        onClick={onSeek}
        style={{
          position: "absolute",
          top: 430 * SCALE,
          left: 27 * SCALE,
          width: PROGRESS_TRACK_WIDTH,
          height: 10 * SCALE,
          cursor: "pointer",
          zIndex: 6,
        }}
      >
        <img
          src={progressBar}
          style={{
            width: PROGRESS_TRACK_WIDTH,
            position: "absolute",
            left: 0,
            top: 0,
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 1 * SCALE,
            left: 0,
            width: `${(progress / 100) * PROGRESS_TRACK_WIDTH}px`,
            height: 4 * SCALE,
            background: progressColor,
          }}
        />

        <img
          src={madkat}
          style={{
            position: "absolute",
            top: -4 * SCALE,
            left: Math.max(
              0,
              Math.min(
                PROGRESS_TRACK_WIDTH - MADKAT_SIZE,
                (progress / 100) * PROGRESS_TRACK_WIDTH - MADKAT_SIZE / 2
              )
            ),
            width: MADKAT_SIZE,
            height: MADKAT_SIZE,
            pointerEvents: "none",
          }}
        />
      </div>
    </>
  );
});

export default ProgressBar;
