export const SCALE = 1.85;

export const PLAYER_WIDTH = 292;
export const PLAYER_HEIGHT = 472;
export const PROGRESS_TRACK_WIDTH = 238 * SCALE;
export const MADKAT_SIZE = 12 * SCALE;

export const THEMES = {
  atapaz: {
    bg: "#020d2c",
    progress: "#8fa4ff",
    panel: "#162257",
  },
  theme2: {
    bg: "#180b2e",
    progress: "#d4a5ff",
    panel: "#3b2159",
  },
};

export const PIXEL_BUTTON = {
  border: "2px solid #2a3d8a",
  background: "#d7deff",
  color: "#1c2a63",
  fontFamily: "'Courier New', monospace",
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.8px",
  padding: "4px 6px",
  boxShadow: "2px 2px 0 #1c2a63",
  cursor: "pointer",
};

export const PIXEL_BUTTON_ACTIVE = {
  ...PIXEL_BUTTON,
  background: "#8fa4ff",
  color: "#ffffff",
  boxShadow: "2px 2px 0 #0f1b4a",
};

export const PIXEL_INPUT = {
  border: "2px solid #2a3d8a",
  background: "#f2f5ff",
  color: "#132052",
  fontFamily: "'Courier New', monospace",
  fontSize: "11px",
  padding: "4px 6px",
  outline: "none",
};

export const YOUTUBE_SCOPE = "https://www.googleapis.com/auth/youtube.readonly";
export const YT_TOKEN_KEY = "atazuki_youtube_token";
export const YT_REFRESH_KEY = "atazuki_youtube_refresh_token";
export const YT_EXPIRY_KEY = "atazuki_youtube_token_expiry";
export const YT_CLIENT_ID_KEY = "atazuki_yt_client_id";
export const YT_CLIENT_SECRET_KEY = "atazuki_yt_client_secret";

export const STORAGE_KEYS = {
  VOLUME: "atazuki_volume",
  MUTED: "atazuki_muted",
  SHUFFLE: "atazuki_shuffle",
  THEME: "atazuki_theme",
  SOURCE: "atazuki_source",
  TRACK_INDEX: "atazuki_track_index",
  NOTIFICATIONS: "atazuki_notifications",
};
