import { memo } from "react";
import { SCALE } from "../constants";
import volumeButton from "../assets/Atapaz/VolumeButton.png";
import volumeBarLow from "../assets/Atapaz/VolumenBarLow.png";
import volumeBarHigh from "../assets/Atapaz/VolumenBarHigh.png";

const VolumeControl = memo(function VolumeControl({
  volume,
  isMuted,
  showVolumeBar,
  volumeBarRef,
  onToggleMute,
  onVolumeChange,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
}) {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: "absolute",
        top: 305 * SCALE,
        left: 238 * SCALE,
        width: 25 * SCALE,
        height: 98 * SCALE,
        zIndex: 6,
      }}
    >
      <div
        ref={volumeBarRef}
        onMouseDown={onMouseDown}
        onClick={(event) => onVolumeChange(event.clientY)}
        style={{
          position: "absolute",
          top: 0,
          left: 8 * SCALE,
          width: 9 * SCALE,
          height: 78 * SCALE,
          cursor: showVolumeBar ? "pointer" : "default",
          opacity: showVolumeBar ? 1 : 0,
          pointerEvents: showVolumeBar ? "auto" : "none",
          transition: "opacity 0.15s",
        }}
      >
        <img
          src={volumeBarLow}
          style={{
            position: "absolute",
            width: 9 * SCALE,
            height: 78 * SCALE,
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: 0,
            width: 9 * SCALE,
            height: `${(volume / 100) * 78 * SCALE}px`,
            overflow: "hidden",
          }}
        >
          <img
            src={volumeBarHigh}
            style={{
              position: "absolute",
              bottom: 0,
              width: 9 * SCALE,
              height: 78 * SCALE,
            }}
          />
        </div>
      </div>

      <img
        src={volumeButton}
        onClick={onToggleMute}
        style={{
          position: "absolute",
          top: 73 * SCALE,
          left: 0,
          width: 25 * SCALE,
          zIndex: 4,
          cursor: "pointer",
          opacity: isMuted ? 0.45 : 1,
          transition: "0.2s",
        }}
      />
    </div>
  );
});

export default VolumeControl;
