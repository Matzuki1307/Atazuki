import { memo, useEffect, useState } from "react";
import { SCALE } from "../constants";
import cassette from "../assets/Atapaz/Cassette.png";
import iconImage from "../assets/Atapaz/Icon.png";
import cassetteFrame0 from "../assets/Animaciones/CassetteRepro/Frame0.png";
import cassetteFrame1 from "../assets/Animaciones/CassetteRepro/Frame1.png";
import cassetteFrame2 from "../assets/Animaciones/CassetteRepro/Frame2.png";
import cassetteFrame3 from "../assets/Animaciones/CassetteRepro/Frame3.png";
import cassetteChangeFrame0 from "../assets/Animaciones/Cambio/Frame0In.png";
import cassetteChangeFrame1 from "../assets/Animaciones/Cambio/Frame1In.png";

const CASSETTE_FRAMES = [cassetteFrame0, cassetteFrame1, cassetteFrame2, cassetteFrame3];
const CASSETTE_CHANGE_FRAMES = [cassetteChangeFrame0, cassetteChangeFrame1];

const CassetteAnimation = memo(function CassetteAnimation({
  isPlaying,
  hasStartedPlayback,
  showChangeAnimation,
  changeFrameIndex,
}) {
  const [cassetteFrameIndex, setCassetteFrameIndex] = useState(0);

  useEffect(() => {
    if (!isPlaying) {
      setCassetteFrameIndex(0);
      return;
    }
    const intervalId = setInterval(() => {
      setCassetteFrameIndex((prev) => (prev + 1) % CASSETTE_FRAMES.length);
    }, 240);
    return () => clearInterval(intervalId);
  }, [isPlaying]);

  return (
    <div
      style={{
        position: "absolute",
        top: 108 * SCALE,
        left: 52 * SCALE,
        width: 187 * SCALE,
        height: 187 * SCALE,
        zIndex: 4,
      }}
    >
      <img
        src={cassette}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: !hasStartedPlayback && !isPlaying && !showChangeAnimation ? 1 : 0,
          transition: "opacity 0.12s",
        }}
      />
      <img
        src={iconImage}
        style={{
          position: "absolute",
          top: 15.6 * SCALE,
          left: 2.6 * SCALE,
          width: "100%",
          height: "100%",
          opacity: hasStartedPlayback && !isPlaying && !showChangeAnimation ? 1 : 0,
          transition: "opacity 0.12s",
        }}
      />
      <img
        src={CASSETTE_FRAMES[cassetteFrameIndex]}
        style={{
          position: "absolute",
          top: 15.6 * SCALE,
          left: 2.6 * SCALE,
          width: "100%",
          height: "100%",
          opacity: isPlaying && !showChangeAnimation ? 1 : 0,
          transition: "opacity 0.12s",
        }}
      />
      <img
        src={CASSETTE_CHANGE_FRAMES[changeFrameIndex]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: showChangeAnimation ? 1 : 0,
          transition: "opacity 0.12s",
        }}
      />
    </div>
  );
});

export default CassetteAnimation;
