const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  minimizeWindow: () => ipcRenderer.send("window:minimize"),
  toggleMaximizeWindow: () => ipcRenderer.send("window:toggle-maximize"),
  closeWindow: () => ipcRenderer.send("window:close"),
  getStreamUrlById: (videoId) =>
    ipcRenderer.invoke("youtube:get-stream-url-by-id", videoId),
  youtubeFetchPlaylist: (url) =>
    ipcRenderer.invoke("youtube:fetch-playlist", url),
  youtubeOauthStart: (options) =>
    ipcRenderer.invoke("youtube:oauth-start", options),
  youtubeOauthCancel: () =>
    ipcRenderer.invoke("youtube:oauth-cancel"),
  onTrayPlayPause: (callback) => {
    ipcRenderer.on("tray:play-pause", callback);
    return () => ipcRenderer.removeListener("tray:play-pause", callback);
  },
  onTrayNext: (callback) => {
    ipcRenderer.on("tray:next", callback);
    return () => ipcRenderer.removeListener("tray:next", callback);
  },
  onTrayPrevious: (callback) => {
    ipcRenderer.on("tray:previous", callback);
    return () => ipcRenderer.removeListener("tray:previous", callback);
  },
  showNotification: (title, body) =>
    ipcRenderer.send("app:show-notification", { title, body }),
  quit: () => ipcRenderer.send("app:quit"),
});
