const { app, BrowserWindow, ipcMain, protocol, net, shell, Tray, Menu, Notification, nativeImage } = require("electron");
const path = require("path");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const http = require("node:http");

const execFileAsync = promisify(execFile);
const STREAM_CACHE_TTL = 25 * 60 * 1000;
let tray = null;
let isQuitting = false;

app.setAppUserModelId("com.atazuki.app");

function getIconPath() {
  return app.isPackaged
    ? path.join(__dirname, "dist", "IconoExe.ico")
    : path.join(__dirname, "public", "IconoExe.ico");
}

function getMadkatPath() {
  return app.isPackaged
    ? path.join(__dirname, "dist", "Madkat.png")
    : path.join(__dirname, "src", "assets", "Atapaz", "Madkat.png");
}
const YT_ID_RE = /^[A-Za-z0-9_-]{11}$/;
const streamUrlCache = new Map();
let activeOauthServer = null;

protocol.registerSchemesAsPrivileged([
  {
    scheme: "cupid-audio",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
      bypassCSP: true,
    },
  },
]);

function getYtDlpPath() {
  const binName = process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp";
  const bundledPath = app.isPackaged
    ? path.join(process.resourcesPath, "bin", binName)
    : path.join(__dirname, "bin", binName);

  try {
    require("node:fs").statSync(bundledPath);
    return bundledPath;
  } catch {
    return binName;
  }
}

async function ytDlpExtract(target) {
  const { stdout } = await execFileAsync(
    getYtDlpPath(),
    [
      target,
      "-f",
      "bestaudio[ext=m4a]/bestaudio",
      "--no-playlist",
      "--no-warnings",
      "-g",
    ],
    { timeout: 20000 }
  );

  return stdout.trim();
}

async function resolveStreamUrl(videoId) {
  if (!YT_ID_RE.test(videoId)) {
    throw new Error("Invalid YouTube video ID");
  }

  const cached = streamUrlCache.get(videoId);
  if (cached && Date.now() - cached.time < STREAM_CACHE_TTL) {
    return cached.url;
  }

  const url = await ytDlpExtract(`https://www.youtube.com/watch?v=${videoId}`);
  streamUrlCache.set(videoId, { url, time: Date.now() });
  return url;
}

function streamProtocolUrl(videoId) {
  if (!YT_ID_RE.test(videoId)) {
    throw new Error("Invalid YouTube video ID");
  }

  return `cupid-audio://stream?id=${encodeURIComponent(videoId)}`;
}

async function fetchYouTubePlaylistViaYtDlp(url) {
  const args = [
    url,
    "--flat-playlist",
    "--dump-single-json",
    "--no-warnings",
    "--ignore-errors",
    "--extractor-args",
    "youtube:player_client=web,android",
  ];

  const { stdout } = await execFileAsync(getYtDlpPath(), args, {
    timeout: 35000,
    maxBuffer: 50 * 1024 * 1024,
  });

  const data = JSON.parse(stdout);
  const entries = Array.isArray(data.entries) ? data.entries : [];

  return entries
    .filter((entry) => entry && entry.id && YT_ID_RE.test(entry.id))
    .map((entry) => ({
      videoId: entry.id,
      title: entry.title || entry.id,
      artist: entry.uploader || entry.channel || "",
      duration: typeof entry.duration === "number" ? entry.duration : null,
    }));
}

function createWindow(hidden = false) {
  const SCALE = 1.85;
  const PLAYER_WIDTH = Math.ceil(292 * SCALE);
  const PLAYER_HEIGHT = Math.ceil(472 * SCALE);

  const win = new BrowserWindow({
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    minWidth: PLAYER_WIDTH,
    maxWidth: PLAYER_WIDTH,
    minHeight: PLAYER_HEIGHT,
    maxHeight: PLAYER_HEIGHT,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    frame: false,
    autoHideMenuBar: true,
    show: !hidden,
    icon: getIconPath(),
    backgroundColor: "#0d1024",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const appIcon = nativeImage.createFromPath(getIconPath());
  win.setIcon(appIcon);

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, "dist", "index.html"));
  } else {
    win.loadURL("http://localhost:5173");
  }

  win.on("close", (event) => {
    if (!isQuitting) {
      event.preventDefault();
      win.hide();
    }
  });

  createTray(win);
  createThumbarButtons(win);
}

function createTray(win) {
  const icon = nativeImage.createFromPath(getIconPath());
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Atazuki",
      click: () => {
        win.show();
        win.focus();
      },
    },
    { type: "separator" },
    {
      label: "Play/Pause",
      click: () => win.webContents.send("tray:play-pause"),
    },
    {
      label: "Siguiente",
      click: () => win.webContents.send("tray:next"),
    },
    {
      label: "Anterior",
      click: () => win.webContents.send("tray:previous"),
    },
    { type: "separator" },
    {
      label: "Cerrar",
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip("Atazuki");
  tray.setContextMenu(contextMenu);

  tray.on("double-click", () => {
    win.show();
    win.focus();
  });
}

function createThumbarButtons(win) {
  if (process.platform !== "win32") return;

  const icon = nativeImage.createFromPath(getIconPath()).resize({ width: 32, height: 32 });

  win.setThumbarButtons([
    {
      tooltip: "Anterior",
      icon,
      click: () => win.webContents.send("tray:previous"),
    },
    {
      tooltip: "Play/Pause",
      icon,
      click: () => win.webContents.send("tray:play-pause"),
    },
    {
      tooltip: "Siguiente",
      icon,
      click: () => win.webContents.send("tray:next"),
    },
  ]);
}

ipcMain.on("window:minimize", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.minimize();
});

ipcMain.on("window:toggle-maximize", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;

  if (win.isMaximized()) {
    win.unmaximize();
    return;
  }

  win.maximize();
});

ipcMain.on("window:close", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;
  win.close();
});

ipcMain.on("app:quit", () => {
  isQuitting = true;
  app.quit();
});

ipcMain.on("app:show-notification", (_event, { title, body, albumArt }) => {
  if (Notification.isSupported()) {
    const notif = new Notification({
      title: title || "Atazuki",
      body: body || "",
      icon: getMadkatPath(),
    });
    notif.on("click", () => {
      const wins = BrowserWindow.getAllWindows();
      if (wins.length > 0) { wins[0].show(); wins[0].focus(); }
    });
    notif.show();
  }
});

ipcMain.handle("youtube:get-stream-url-by-id", async (_event, videoId) => {
  return streamProtocolUrl(videoId);
});

ipcMain.handle("youtube:fetch-playlist", async (_event, url) => {
  try {
    return await fetchYouTubePlaylistViaYtDlp(url);
  } catch (error) {
    const raw = error?.stderr || error?.message || "";

    if (/sign in|requires authentication|login required/i.test(raw)) {
      throw new Error(
        "La playlist requiere autenticacion. Usa el login de YouTube en ajustes para playlists privadas."
      );
    }

    if (/private/i.test(raw)) {
      throw new Error(
        "La playlist es privada. Usa el login de YouTube en ajustes para cargarla."
      );
    }

    if (/does not exist/i.test(raw)) {
      if (/music\.youtube/i.test(url)) {
        throw new Error(
          `No se pudo abrir la playlist de YouTube Music. Verifica la URL e intenta de nuevo. Si es privada, usa el login de YouTube en ajustes.`
        );
      }
      throw new Error(
        "No se pudo abrir la playlist. Verifica que la URL sea correcta y que sea publica o no listada."
      );
    }

    throw new Error(`Error de YouTube: ${raw.slice(0, 200)}`);
  }
});

ipcMain.handle("youtube:oauth-start", async (_event, options) => {
  const { clientId, scope, state, codeChallenge } = options || {};

  if (!clientId || !scope || !state || !codeChallenge) {
    throw new Error("OAuth parameters are incomplete");
  }

  if (activeOauthServer) {
    try {
      activeOauthServer.close();
    } catch {
      // ignore
    }
    activeOauthServer = null;
  }

  const { port, server, codePromise } = await new Promise((resolve, reject) => {
    let resolveCode;
    let rejectCode;
    const pendingCode = new Promise((res, rej) => {
      resolveCode = res;
      rejectCode = rej;
    });

    const createdServer = http.createServer((req, res) => {
      const requestUrl = new URL(req.url, "http://127.0.0.1");
      if (requestUrl.pathname !== "/youtube-callback") {
        res.writeHead(404);
        res.end("not found");
        return;
      }

      const code = requestUrl.searchParams.get("code");
      const returnedState = requestUrl.searchParams.get("state");
      const error = requestUrl.searchParams.get("error");

      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });

      if (error) {
        res.end("<html><body>Auth cancelled. You can close this tab.</body></html>");
        rejectCode(new Error(error));
      } else if (!code) {
        res.end("<html><body>Missing code. You can close this tab.</body></html>");
        rejectCode(new Error("No code in callback"));
      } else if (returnedState !== state) {
        res.end("<html><body>State mismatch. You can close this tab.</body></html>");
        rejectCode(new Error("OAuth state mismatch"));
      } else {
        res.end("<html><body>Login successful. You can return to Atazuki.</body></html>");
        resolveCode(code);
      }

      setTimeout(() => {
        try {
          createdServer.close();
        } catch {
          // ignore
        }
      }, 300);
    });

    createdServer.on("error", reject);
    createdServer.listen(0, "127.0.0.1", () => {
      resolve({
        port: createdServer.address().port,
        server: createdServer,
        codePromise: pendingCode,
      });
    });
  });

  activeOauthServer = server;

  const redirectUri = `http://127.0.0.1:${port}/youtube-callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    access_type: "offline",
    prompt: "consent",
  });

  shell.openExternal(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);

  const timeout = setTimeout(() => {
    try {
      server.close();
    } catch {
      // ignore
    }
  }, 5 * 60 * 1000);

  try {
    const code = await codePromise;
    clearTimeout(timeout);
    activeOauthServer = null;
    return { code, redirectUri };
  } catch (error) {
    clearTimeout(timeout);
    activeOauthServer = null;
    throw error;
  }
});

ipcMain.handle("youtube:oauth-cancel", () => {
  if (activeOauthServer) {
    try {
      activeOauthServer.close();
    } catch {
      // ignore
    }
    activeOauthServer = null;
  }
});

app.whenReady().then(() => {
  protocol.handle("cupid-audio", async (request) => {
    try {
      const id = new URL(request.url).searchParams.get("id");
      if (!id) return new Response("missing id", { status: 400 });

      const streamUrl = await resolveStreamUrl(id);

      const headers = {
        Origin: "https://www.youtube.com",
        Referer: "https://www.youtube.com/",
        "User-Agent": "Mozilla/5.0",
      };

      const range = request.headers.get("Range");
      if (range) headers.Range = range;

      const upstream = await net.fetch(streamUrl, { headers });
      const responseHeaders = new Headers(upstream.headers);
      responseHeaders.set("Content-Type", "audio/mp4");

      return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: responseHeaders,
      });
    } catch (error) {
      return new Response(error?.message || "stream failed", { status: 502 });
    }
  });

  const hidden = process.argv.includes("--hidden");
  createWindow(hidden);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin" && isQuitting) app.quit();
});

app.on("before-quit", () => {
  isQuitting = true;
});

app.on("activate", () => {
  const wins = BrowserWindow.getAllWindows();
  if (wins.length > 0) {
    wins[0].show();
    wins[0].focus();
  }
});
