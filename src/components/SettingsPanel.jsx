import { memo } from "react";
import {
  SCALE,
  PIXEL_BUTTON,
  PIXEL_BUTTON_ACTIVE,
  PIXEL_INPUT,
} from "../constants";

const SettingsPanel = memo(function SettingsPanel({
  show,
  theme,
  currentTheme,
  musicSource,
  youtubeClientId,
  youtubeClientSecret,
  youtubeConnected,
  youtubeAuthLoading,
  youtubeLoading,
  youtubePlaylistsLoading,
  youtubePlaylists,
  youtubeChannelName,
  youtubeUrlInput,
  youtubeTracks,
  showNotifications,
  settingsMessage,
  onChangeTheme,
  onSwitchSource,
  onToggleNotifications,
  onYoutubeClientIdChange,
  onYoutubeClientSecretChange,
  onYoutubeLogin,
  onYoutubeLogout,
  onYoutubeSync,
  onYoutubeUrlChange,
  onYoutubeUrlLoad,
  onLoadPrivatePlaylist,
}) {
  if (!show) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 45 * SCALE,
        left: 120 * SCALE,
        width: 145 * SCALE,
        background: currentTheme.panel,
        border: "2px solid #8fa4ff",
        borderRadius: "8px",
        padding: "10px",
        zIndex: 20,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        WebkitAppRegion: "no-drag",
      }}
    >
      <div style={{ color: "#dbe2ff", fontSize: "12px" }}>Tema</div>
      <div style={{ display: "flex", gap: "6px" }}>
        <button
          style={theme === "atapaz" ? PIXEL_BUTTON_ACTIVE : PIXEL_BUTTON}
          onClick={() => onChangeTheme("atapaz")}
        >
          Atapaz
        </button>
        <button
          style={theme === "theme2" ? PIXEL_BUTTON_ACTIVE : PIXEL_BUTTON}
          onClick={() => onChangeTheme("theme2")}
        >
          Tema 2
        </button>
      </div>

      <div style={{ color: "#dbe2ff", fontSize: "12px" }}>Fuente</div>
      <div style={{ display: "flex", gap: "6px" }}>
        <button
          style={musicSource === "local" ? PIXEL_BUTTON_ACTIVE : PIXEL_BUTTON}
          onClick={() => onSwitchSource("local")}
        >
          Local
        </button>
        <button
          style={musicSource === "youtube" ? PIXEL_BUTTON_ACTIVE : PIXEL_BUTTON}
          onClick={() => onSwitchSource("youtube")}
        >
          YouTube
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <div style={{ color: "#dbe2ff", fontSize: "12px" }}>Notificaciones</div>
        <button
          style={
            showNotifications
              ? { ...PIXEL_BUTTON, background: "#8fa4ff", color: "#ffffff" }
              : PIXEL_BUTTON
          }
          onClick={onToggleNotifications}
        >
          {showNotifications ? "ON" : "OFF"}
        </button>
      </div>

      <div style={{ color: "#dbe2ff", fontSize: "12px" }}>
        {musicSource === "youtube" ? "Playlist YouTube" : "Playlist local activa"}
      </div>

      {musicSource === "youtube" && (
        <>
          <div style={{ color: "#dbe2ff", fontSize: "11px" }}>
            Credenciales YouTube
          </div>
          <input
            value={youtubeClientId}
            onChange={(e) => onYoutubeClientIdChange(e.target.value)}
            placeholder="Client ID"
            style={PIXEL_INPUT}
          />
          <input
            value={youtubeClientSecret}
            onChange={(e) => onYoutubeClientSecretChange(e.target.value)}
            placeholder="Client Secret"
            style={PIXEL_INPUT}
          />
          {youtubeConnected && youtubeChannelName && (
            <div style={{ color: "#b0baff", fontSize: "10px", textAlign: "center" }}>
              {youtubeChannelName}
            </div>
          )}

          <div style={{ display: "flex", gap: "6px" }}>
            {!youtubeConnected ? (
              <button
                style={PIXEL_BUTTON}
                onClick={onYoutubeLogin}
                disabled={youtubeAuthLoading}
              >
                {youtubeAuthLoading ? "Conectando..." : "Login YT"}
              </button>
            ) : (
              <>
                <button
                  style={PIXEL_BUTTON}
                  onClick={onYoutubeSync}
                  disabled={youtubePlaylistsLoading}
                >
                  {youtubePlaylistsLoading ? "Sync..." : "Sync"}
                </button>
                <button style={PIXEL_BUTTON} onClick={onYoutubeLogout}>
                  Logout
                </button>
              </>
            )}
          </div>

          <input
            value={youtubeUrlInput}
            onChange={(e) => onYoutubeUrlChange(e.target.value)}
            placeholder="Pega URL playlist"
            style={PIXEL_INPUT}
          />
          <button
            style={PIXEL_BUTTON}
            onClick={onYoutubeUrlLoad}
            disabled={youtubeLoading || !youtubeUrlInput.trim()}
          >
            {youtubeLoading ? "Cargando..." : "Cargar playlist"}
          </button>
          <div style={{ color: "#dbe2ff", fontSize: "11px" }}>
            Tracks: {youtubeTracks.length}
          </div>

          {youtubeConnected && youtubePlaylists.length > 0 && (
            <div
              style={{
                maxHeight: "90px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              {youtubePlaylists.map((playlist) => (
                <button
                  key={playlist.id}
                  style={{
                    ...PIXEL_BUTTON,
                    textAlign: "left",
                    fontSize: "10px",
                    boxShadow: "1px 1px 0 #1c2a63",
                  }}
                  onClick={() => onLoadPrivatePlaylist(playlist.id)}
                  disabled={youtubeLoading}
                >
                  {playlist.name} ({playlist.count})
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <div style={{ color: "#dbe2ff", fontSize: "11px" }}>
        {settingsMessage}
      </div>
    </div>
  );
});

export default SettingsPanel;
