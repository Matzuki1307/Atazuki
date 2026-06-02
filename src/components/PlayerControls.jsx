import { memo } from "react";
import { SCALE } from "../constants";
import shuffleButton from "../assets/Atapaz/ShuffleButton.png";
import previousButton from "../assets/Atapaz/PreviousButton.png";
import playButton from "../assets/Atapaz/PlayButton.png";
import pauseButton from "../assets/Atapaz/PauseButton.png";
import nextButton from "../assets/Atapaz/NextButton.png";
import albumCover from "../assets/Atapaz/AlbumCover.png";
import albumFrame from "../assets/Atapaz/AlbumFrame.png";

const PlayerControls = memo(function PlayerControls({
  isPlaying,
  isShuffle,
  currentTrack,
  progressColor,
  onTogglePlay,
  onPrevious,
  onNext,
  onToggleShuffle,
}) {
  return (
    <>
      <img
        src={albumFrame}
        style={{
          position: "absolute",
          top: 318 * SCALE,
          left: 24 * SCALE,
          width: 41 * SCALE,
          zIndex: 4,
        }}
      />
      <img
        src={currentTrack?.art || albumCover}
        style={{
          position: "absolute",
          top: 319 * SCALE,
          left: 25 * SCALE,
          width: 39 * SCALE,
          height: 39 * SCALE,
          objectFit: "cover",
          zIndex: 5,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 337 * SCALE,
          left: 69 * SCALE,
          width: 196 * SCALE,
          color: progressColor,
          fontFamily: "'Courier New', 'Lucida Console', monospace",
          fontSize: `${7 * SCALE}px`,
          letterSpacing: "1px",
          textTransform: "uppercase",
          textShadow: "1px 1px 0 rgba(0,0,0,0.45)",
          zIndex: 6,
          overflow: "hidden",
          WebkitAppRegion: "no-drag",
        }}
      >
        <div
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {currentTrack?.title || "SIN TRACK"}
        </div>
        <div
          style={{
            marginTop: `${2 * SCALE}px`,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            opacity: 0.95,
          }}
        >
          {currentTrack?.artist || ""}
        </div>
      </div>

      <img
        src={shuffleButton}
        onClick={onToggleShuffle}
        style={{
          position: "absolute",
          top: 378 * SCALE,
          left: 28 * SCALE,
          width: 22 * SCALE,
          zIndex: 4,
          cursor: "pointer",
          opacity: isShuffle ? 1 : 0.55,
          WebkitAppRegion: "no-drag",
        }}
      />

      <img
        src={previousButton}
        onClick={onPrevious}
        style={{
          position: "absolute",
          top: 370 * SCALE,
          left: 70 * SCALE,
          width: 44 * SCALE,
          zIndex: 4,
          cursor: "pointer",
          WebkitAppRegion: "no-drag",
        }}
      />

      <img
        src={isPlaying ? pauseButton : playButton}
        onClick={onTogglePlay}
        style={{
          position: "absolute",
          top: 370 * SCALE,
          left: 124 * SCALE,
          width: 44 * SCALE,
          zIndex: 4,
          cursor: "pointer",
          WebkitAppRegion: "no-drag",
        }}
      />

      <img
        src={nextButton}
        onClick={onNext}
        style={{
          position: "absolute",
          top: 370 * SCALE,
          left: 178 * SCALE,
          width: 44 * SCALE,
          zIndex: 4,
          cursor: "pointer",
          WebkitAppRegion: "no-drag",
        }}
      />
    </>
  );
});

export default PlayerControls;
