import { useEffect, useRef } from "react";

export function useKeyboard(handlers) {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    const onKeyDown = (event) => {
      const target = event.target;
      const tagName = target?.tagName;
      const isTyping =
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (isTyping) return;

      const h = handlersRef.current;

      if (event.code === "Space") {
        event.preventDefault();
        h.onTogglePlay?.();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        h.onSeekForward?.();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        h.onSeekBackward?.();
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        h.onVolumeUp?.();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        h.onVolumeDown?.();
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
