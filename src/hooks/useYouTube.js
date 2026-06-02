import { useState, useCallback, useEffect } from "react";
import {
  YOUTUBE_SCOPE,
  YT_TOKEN_KEY,
  YT_REFRESH_KEY,
  YT_EXPIRY_KEY,
  YT_CLIENT_ID_KEY,
  YT_CLIENT_SECRET_KEY,
} from "../constants";

function randomString(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values, (value) => chars[value % chars.length]).join("");
}

function base64UrlEncode(buffer) {
  const bytes = new Uint8Array(buffer);
  const str = String.fromCharCode(...bytes);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sha256(value) {
  const encoder = new TextEncoder();
  return crypto.subtle.digest("SHA-256", encoder.encode(value));
}

async function makeCodeChallenge(verifier) {
  return base64UrlEncode(await sha256(verifier));
}

function storeYoutubeTokens({ access_token, refresh_token, expires_in }) {
  if (access_token) localStorage.setItem(YT_TOKEN_KEY, access_token);
  if (refresh_token) localStorage.setItem(YT_REFRESH_KEY, refresh_token);
  if (expires_in) {
    localStorage.setItem(YT_EXPIRY_KEY, String(Date.now() + expires_in * 1000));
  }
}

function clearYoutubeTokens() {
  localStorage.removeItem(YT_TOKEN_KEY);
  localStorage.removeItem(YT_REFRESH_KEY);
  localStorage.removeItem(YT_EXPIRY_KEY);
}

export function useYouTube() {
  const [youtubeUrlInput, setYoutubeUrlInput] = useState("");
  const [youtubeTracks, setYoutubeTracks] = useState([]);
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [youtubeConnected, setYoutubeConnected] = useState(
    !!localStorage.getItem(YT_TOKEN_KEY)
  );
  const [youtubeAuthLoading, setYoutubeAuthLoading] = useState(false);
  const [youtubePlaylists, setYoutubePlaylists] = useState([]);
  const [youtubePlaylistsLoading, setYoutubePlaylistsLoading] = useState(false);
  const [youtubeChannelName, setYoutubeChannelName] = useState("");
  const [youtubeClientId, setYoutubeClientIdState] = useState(
    () => localStorage.getItem(YT_CLIENT_ID_KEY) || import.meta.env.VITE_YOUTUBE_CLIENT_ID || ""
  );
  const [youtubeClientSecret, setYoutubeClientSecretState] = useState(
    () => localStorage.getItem(YT_CLIENT_SECRET_KEY) || import.meta.env.VITE_YOUTUBE_CLIENT_SECRET || ""
  );

  const setYoutubeClientId = useCallback((value) => {
    setYoutubeClientIdState(value);
    localStorage.setItem(YT_CLIENT_ID_KEY, value);
  }, []);

  const setYoutubeClientSecret = useCallback((value) => {
    setYoutubeClientSecretState(value);
    localStorage.setItem(YT_CLIENT_SECRET_KEY, value);
  }, []);

  const refreshYouTubeAccessToken = useCallback(async () => {
    const refreshToken = localStorage.getItem(YT_REFRESH_KEY);
    if (!refreshToken || !youtubeClientId) return null;

    const body = new URLSearchParams({
      client_id: youtubeClientId,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    });

    if (youtubeClientSecret) {
      body.set("client_secret", youtubeClientSecret);
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!response.ok) {
      clearYoutubeTokens();
      setYoutubeConnected(false);
      return null;
    }

    const data = await response.json();
    storeYoutubeTokens(data);
    return data.access_token || null;
  }, [youtubeClientId, youtubeClientSecret]);

  const getYouTubeAccessToken = useCallback(async () => {
    const token = localStorage.getItem(YT_TOKEN_KEY);
    const expiry = Number(localStorage.getItem(YT_EXPIRY_KEY) || "0");
    if (token && Date.now() < expiry - 60000) {
      return token;
    }
    return refreshYouTubeAccessToken();
  }, [refreshYouTubeAccessToken]);

  const youtubeApi = useCallback(async (path, params = {}) => {
    const token = await getYouTubeAccessToken();
    if (!token) throw new Error("No hay sesion activa de YouTube");

    const url = new URL(`https://www.googleapis.com/youtube/v3${path}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`YouTube API ${response.status}: ${text}`);
    }

    return response.json();
  }, [getYouTubeAccessToken]);

  const loadYouTubeChannel = useCallback(async () => {
    try {
      const data = await youtubeApi("/channels", {
        part: "snippet",
        mine: "true",
      });
      const name = data?.items?.[0]?.snippet?.title || "";
      setYoutubeChannelName(name);
      return name;
    } catch {
      setYoutubeChannelName("");
      return "";
    }
  }, [youtubeApi]);

  const loadYouTubePlaylists = useCallback(async () => {
    setYoutubePlaylistsLoading(true);

    try {
      const playlists = [];
      let pageToken = undefined;

      do {
        const data = await youtubeApi("/playlists", {
          part: "snippet,contentDetails",
          mine: "true",
          maxResults: "50",
          ...(pageToken ? { pageToken } : {}),
        });

        (data.items || []).forEach((playlist) => {
          playlists.push({
            id: playlist.id,
            name: playlist.snippet?.title || "(sin nombre)",
            count: playlist.contentDetails?.itemCount || 0,
          });
        });

        pageToken = data.nextPageToken;
      } while (pageToken);

      setYoutubePlaylists(playlists);
      return `Playlists privadas: ${playlists.length}`;
    } catch (error) {
      return error?.message || "No se pudieron cargar playlists";
    } finally {
      setYoutubePlaylistsLoading(false);
    }
  }, [youtubeApi]);

  const handleYouTubeLogin = useCallback(async () => {
    if (!window.electronAPI?.youtubeOauthStart) {
      return "OAuth YouTube no disponible en este build";
    }

    if (!youtubeClientId) {
      return "Falta Client ID de YouTube en ajustes";
    }

    setYoutubeAuthLoading(true);

    try {
      const verifier = randomString(64);
      const challenge = await makeCodeChallenge(verifier);
      const state = randomString(32);

      const { code, redirectUri } = await window.electronAPI.youtubeOauthStart({
        clientId: youtubeClientId,
        scope: YOUTUBE_SCOPE,
        state,
        codeChallenge: challenge,
      });

      const body = new URLSearchParams({
        code,
        client_id: youtubeClientId,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        code_verifier: verifier,
      });

      if (youtubeClientSecret) {
        body.set("client_secret", youtubeClientSecret);
      }

      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });

      if (!response.ok) {
        const text = await response.text();
        return `No se pudo completar login de YouTube: ${text}`;
      }

      const data = await response.json();
      storeYoutubeTokens(data);
      setYoutubeConnected(true);
      const channelName = await loadYouTubeChannel();
      const playlistsMsg = await loadYouTubePlaylists();
      const prefix = channelName ? `Cuenta: ${channelName}. ` : "";
      return `${prefix}Sesion YouTube iniciada. ${playlistsMsg}`;
    } catch (error) {
      return error?.message || "Error en login de YouTube";
    } finally {
      setYoutubeAuthLoading(false);
    }
  }, [youtubeClientId, youtubeClientSecret, loadYouTubePlaylists, loadYouTubeChannel]);

  useEffect(() => {
    if (!youtubeConnected) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    youtubeApi("/channels", { part: "snippet", mine: "true" })
      .then((data) => {
        if (cancelled) return;
        setYoutubeChannelName(data?.items?.[0]?.snippet?.title || "");
      })
      .catch(() => {
        if (cancelled) return;
        setYoutubeChannelName("");
      });
    return () => { cancelled = true; };
  }, [youtubeConnected, youtubeApi]);

  const handleYouTubeLogout = useCallback(() => {
    clearYoutubeTokens();
    setYoutubeConnected(false);
    setYoutubePlaylists([]);
    setYoutubeChannelName("");
    return "Sesion YouTube cerrada";
  }, []);

  return {
    youtubeUrlInput, setYoutubeUrlInput,
    youtubeTracks, setYoutubeTracks,
    youtubeLoading, setYoutubeLoading,
    youtubeConnected,
    youtubeAuthLoading,
    youtubePlaylists,
    youtubePlaylistsLoading,
    youtubeChannelName,
    youtubeClientId, setYoutubeClientId,
    youtubeClientSecret, setYoutubeClientSecret,
    loadYouTubePlaylists,
    loadYouTubeChannel,
    handleYouTubeLogin,
    handleYouTubeLogout,
    youtubeApi,
    setYoutubeConnected,
  };
}
