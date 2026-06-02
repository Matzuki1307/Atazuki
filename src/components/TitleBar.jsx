import { memo } from "react";
import { SCALE } from "../constants";
import minimizerButton from "../assets/Atapaz/MinimizerButton.png";
import windowButton from "../assets/Atapaz/WindowButton.png";
import exitButton from "../assets/Atapaz/ExitButton.png";
import settingsButton from "../assets/Atapaz/Settings.png";
import bookImage from "../assets/Atapaz/Libro.png";

const TitleBar = memo(function TitleBar({
  onMinimize,
  onToggleWindow,
  onClose,
  onToggleSettings,
  onOpenLetter,
}) {
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 210 * SCALE,
          height: 34 * SCALE,
          zIndex: 5,
          WebkitAppRegion: "drag",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 34 * SCALE,
          left: 0,
          width: 45 * SCALE,
          height: 32 * SCALE,
          zIndex: 5,
          WebkitAppRegion: "drag",
        }}
      />

      <img
        src={settingsButton}
        onClick={onToggleSettings}
        style={{
          position: "absolute",
          top: 13 * SCALE,
          left: 200 * SCALE,
          width: 13 * SCALE,
          zIndex: 6,
          cursor: "pointer",
          WebkitAppRegion: "no-drag",
        }}
      />

      <img
        src={minimizerButton}
        onClick={onMinimize}
        style={{
          position: "absolute",
          top: 10 * SCALE,
          left: 215 * SCALE,
          width: 27 * SCALE,
          zIndex: 4,
          cursor: "pointer",
          WebkitAppRegion: "no-drag",
        }}
      />

      <img
        src={windowButton}
        onClick={onToggleWindow}
        style={{
          position: "absolute",
          top: 10 * SCALE,
          left: 240 * SCALE,
          width: 19 * SCALE,
          zIndex: 4,
          cursor: "pointer",
          WebkitAppRegion: "no-drag",
        }}
      />

      <img
        src={exitButton}
        onClick={onClose}
        style={{
          position: "absolute",
          top: 10 * SCALE,
          left: 260 * SCALE,
          width: 19 * SCALE,
          zIndex: 4,
          cursor: "pointer",
          WebkitAppRegion: "no-drag",
        }}
      />

      <img
        src={bookImage}
        onClick={onOpenLetter}
        style={{
          position: "absolute",
          bottom: "336px",
          left: "26px",
          width: `${57 * SCALE}px`,
          height: "auto",
          zIndex: 6,
          cursor: "pointer",
          opacity: 0.65,
          transition: "opacity 0.2s, transform 0.2s",
          WebkitAppRegion: "no-drag",
        }}
      />
    </>
  );
});

export default TitleBar;
