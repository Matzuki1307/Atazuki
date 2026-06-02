import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import song1 from "./assets/Atazuki.mp3";
import song2 from "./assets/Atazuki2.wav";
import albumCover from "./assets/Atapaz/AlbumCover.png";
import deviceFrame from "./assets/Atapaz/DeviceFrame.png";
import scene from "./assets/Atapaz/DeviceFrameSinFondo.png";
import { SCALE, THEMES, PIXEL_BUTTON, STORAGE_KEYS } from "./constants";
import { useYouTube } from "./hooks/useYouTube";
import { useKeyboard } from "./hooks/useKeyboard";
import { useMediaSession } from "./hooks/useMediaSession";
import ErrorBoundary from "./components/ErrorBoundary";
import TitleBar from "./components/TitleBar";
import CassetteAnimation from "./components/CassetteAnimation";
import VolumeControl from "./components/VolumeControl";
import ProgressBar from "./components/ProgressBar";
import PlayerControls from "./components/PlayerControls";
import SettingsPanel from "./components/SettingsPanel";
import LetterPopup from "./components/LetterPopup";

const LOCAL_TRACKS = [
  { title: "Atazuki", artist: "Atapaz", src: song1, art: albumCover },
  { title: "Atazuki 2", artist: "Atapaz", src: song2, art: albumCover },
];

const AUDIO_EXTS = [".mp3", ".wav", ".ogg", ".flac", ".m4a", ".aac", ".webm"];

function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem(STORAGE_KEYS.THEME) || "atapaz"
  );
  const [showSettings, setShowSettings] = useState(false);
  const [showPopup, setShowPopup] = useState(
    () => !localStorage.getItem("atazuki_letter_dismissed")
  );
  const [popupView, setPopupView] = useState("selector");
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [ytStreamUrl, setYtStreamUrl] = useState("");
  const [musicSource, setMusicSource] = useState(
    () => localStorage.getItem(STORAGE_KEYS.SOURCE) || "local"
  );
  const [settingsMessage, setSettingsMessage] = useState("");
  const [extraTracks, setExtraTracks] = useState([]);

  const currentTheme = THEMES[theme];
  const {
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
    handleYouTubeLogin,
    handleYouTubeLogout,
    youtubeApi,
  } = useYouTube();

  const allLocalTracks = useMemo(
    () => [...LOCAL_TRACKS, ...extraTracks],
    [extraTracks]
  );

  const tracks =
    musicSource === "youtube" && 
youtubeTracks.length > 0
      ? 
youtubeTracks
      : allLocalTracks;

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(
    () => localStorage.getItem(STORAGE_KEYS.MUTED) === "true"
  );
  const [volume, setVolume] = useState(
    () => Number(localStorage.getItem(STORAGE_KEYS.VOLUME)) || 80
  );
  const [showVolumeBar, setShowVolumeBar] = useState(false);
  const [isShuffle, setIsShuffle] = useState(
    () => localStorage.getItem(STORAGE_KEYS.SHUFFLE) === "true"
  );
  const [isVolumeDragging, setIsVolumeDragging] = useState(false);
  const [trackIndex, setTrackIndex] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRACK_INDEX);
    return saved ? Number(saved) : 0;
  });
  const [hasStartedPlayback, setHasStartedPlayback] = useState(false);
  const [showChangeAnimation, setShowChangeAnimation] = useState(false);
  const [showNotifications, setShowNotifications] = useState(
    () => localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) !== "false"
  );
  const [changeFrameIndex, setChangeFrameIndex] = useState(0);

  const audioRef = useRef(null);
  const volumeBarRef = useRef(null);
  const isTransitioningRef = useRef(false);
  const queuedPlayRef = useRef(false);
  const togglePlayRef = useRef(null);
  const objectUrlsRef = useRef([]);

  const currentTrack = tracks[trackIndex] || null;
  const resolvedSrc = currentTrack?.src || ytStreamUrl;

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.THEME, theme); }, [theme]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SOURCE, musicSource); }, [musicSource]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.VOLUME, String(volume)); }, [volume]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.MUTED, String(isMuted)); }, [isMuted]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SHUFFLE, String(isShuffle)); }, [isShuffle]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, String(showNotifications)); }, [showNotifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRACK_INDEX, String(trackIndex));
  }, [trackIndex]);

  useEffect(() => {
    if (trackIndex >= tracks.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTrackIndex(0);
    }
  }, [tracks.length, trackIndex]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume / 100;
    audioRef.current.muted = isMuted;
  }, [volume, isMuted]);

  useEffect(() => {
    if (!
youtubeConnected) return;
    
loadYouTubePlaylists().then(setSettingsMessage);
  }, [
youtubeConnected, 
loadYouTubePlaylists]);

  useEffect(() => {
    if (!currentTrack?.videoId) return;
    if (!window.electronAPI?.getStreamUrlById) return;

    let cancelled = false;
    window.electronAPI
      .getStreamUrlById(currentTrack.videoId)
      .then((streamUrl) => {
        if (cancelled) return;
        setYtStreamUrl(streamUrl || "");
      })
      .catch((error) => {
        if (cancelled) return;
        setSettingsMessage(error?.message || "No se pudo cargar stream de YouTube");
        setIsPlaying(false);
      });

    return () => { cancelled = true; };
  }, [currentTrack?.videoId]);

  useEffect(() => {
    if (!audioRef.current || !resolvedSrc || !queuedPlayRef.current) return;
    queuedPlayRef.current = false;
    audioRef.current.play().then(
      () => setIsPlaying(true),
      () => setIsPlaying(false)
    );
  }, [resolvedSrc]);

  const formatTime = useCallback((time) => {
    if (!time || !Number.isFinite(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }, []);

  const runChangeAnimation = useCallback((onComplete) => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setShowChangeAnimation(true);
    setChangeFrameIndex(0);

    setTimeout(() => { setChangeFrameIndex(1); }, 130);
    setTimeout(() => {
      setShowChangeAnimation(false);
      setChangeFrameIndex(0);
      isTransitioningRef.current = false;
      onComplete?.();
    }, 260);
  }, []);

  const startPlayback = useCallback(() => {
    if (!audioRef.current || isTransitioningRef.current || !currentTrack) return;

    const playNow = () => {
      if (!resolvedSrc) {
        queuedPlayRef.current = true;
        setIsPlaying(true);
        return;
      }
      audioRef.current.play().then(
        () => setIsPlaying(true),
        () => setIsPlaying(false)
      );
    };

    if (!hasStartedPlayback) {
      runChangeAnimation(playNow);
    } else {
      playNow();
    }
    setHasStartedPlayback(true);
  }, [currentTrack, resolvedSrc, hasStartedPlayback, runChangeAnimation]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentTrack || isTransitioningRef.current) return;

    if (isPlaying) {
      queuedPlayRef.current = false;
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    startPlayback();
  }, [currentTrack, isPlaying, startPlayback]);

  useEffect(() => {
    togglePlayRef.current = togglePlay;
  });

  const getNextTrackIndex = useCallback((direction) => {
    if (tracks.length < 2) return trackIndex;
    if (isShuffle) {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * tracks.length);
      } while (nextIndex === trackIndex && tracks.length > 1);
      return nextIndex;
    }
    return (trackIndex + direction + tracks.length) % tracks.length;
  }, [tracks.length, trackIndex, isShuffle]);

  const handleTrackChange = useCallback((direction) => {
    if (!audioRef.current || isTransitioningRef.current || tracks.length < 2) return;

    const wasPlaying = isPlaying;
    const nextTrackIndex = getNextTrackIndex(direction);

    audioRef.current.pause();
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setTrackIndex(nextTrackIndex);

    if (wasPlaying) {
      setIsPlaying(true);
      queuedPlayRef.current = true;
    } else {
      setIsPlaying(false);
    }

    setHasStartedPlayback(true);
    runChangeAnimation();
  }, [tracks.length, isPlaying, getNextTrackIndex, runChangeAnimation]);

  const toggleMute = useCallback(() => setIsMuted((prev) => !prev), []);

  const handleVolumeChange = useCallback((clientY) => {
    const rect = volumeBarRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clickY = rect.bottom - clientY;
    const percentage = Math.max(0, Math.min(100, (clickY / rect.height) * 100));
    setVolume(percentage);
    if (percentage > 0) setIsMuted(false);
  }, []);

  const updateProgress = useCallback(() => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const total = audioRef.current.duration || 1;
    setCurrentTime(current);
    setDuration(total);
    setProgress((current / total) * 100);
  }, []);

  const handleSeek = useCallback((e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    audioRef.current.currentTime = percentage * duration;
  }, [duration]);

  const switchMusicSource = useCallback((nextSource) => {
    if (nextSource === musicSource) return;
    if (audioRef.current) audioRef.current.pause();
    queuedPlayRef.current = false;
    setIsPlaying(false);
    setTrackIndex(0);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setHasStartedPlayback(false);
    setMusicSource(nextSource);
  }, [musicSource]);

  const handleMinimize = useCallback(() => {
    window.electronAPI?.minimizeWindow?.();
  }, []);

  const handleToggleWindow = useCallback(() => {
    window.electronAPI?.toggleMaximizeWindow?.();
  }, []);

  const handleCloseWindow = useCallback(() => {
    window.electronAPI?.closeWindow?.();
  }, []);

  const handleVolumeDragStart = useCallback((event) => {
    event.preventDefault();
    handleVolumeChange(event.clientY);
    setIsVolumeDragging(true);
  }, [handleVolumeChange]);

  useEffect(() => {
    if (!isVolumeDragging) return;

    const onMouseMove = (event) => {
      const rect = volumeBarRef.current?.getBoundingClientRect();
      if (!rect) return;
      const clickY = rect.bottom - event.clientY;
      const percentage = Math.max(0, Math.min(100, (clickY / rect.height) * 100));
      setVolume(percentage);
      if (percentage > 0) setIsMuted(false);
    };

    const onMouseUp = () => setIsVolumeDragging(false);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isVolumeDragging]);

  useKeyboard({
    onTogglePlay: () => togglePlayRef.current?.(),
    onSeekForward: () => {
      if (!audioRef.current) return;
      const total = audioRef.current.duration || duration || 0;
      if (!total) return;
      audioRef.current.currentTime = Math.min(total, audioRef.current.currentTime + 5);
    },
    onSeekBackward: () => {
      if (!audioRef.current) return;
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
    },
    onVolumeUp: () => {
      setVolume((prev) => {
        const next = Math.min(100, prev + 5);
        if (next > 0) setIsMuted(false);
        return next;
      });
    },
    onVolumeDown: () => {
      setVolume((prev) => Math.max(0, prev - 5));
    },
  });

  useMediaSession({
    currentTrack,
    isPlaying,
    onTogglePlay: togglePlay,
    onNext: () => handleTrackChange(1),
    onPrevious: () => handleTrackChange(-1),
    onSeekForward: () => {
      if (!audioRef.current) return;
      const total = audioRef.current.duration || duration || 0;
      if (!total) return;
      audioRef.current.currentTime = Math.min(total, audioRef.current.currentTime + 10);
    },
    onSeekBackward: () => {
      if (!audioRef.current) return;
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    },
  });

  const cleanObjectUrls = useCallback(() => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];
  }, []);

  useEffect(() => {
    return () => cleanObjectUrls();
  }, [cleanObjectUrls]);

  useEffect(() => {
    if (!window.electronAPI?.onTrayPlayPause) return;
    const cleanups = [
      window.electronAPI.onTrayPlayPause(() => togglePlayRef.current?.()),
      window.electronAPI.onTrayNext(() => handleTrackChange(1)),
      window.electronAPI.onTrayPrevious(() => handleTrackChange(-1)),
    ];
    return () => cleanups.forEach((fn) => fn?.());
  }, [handleTrackChange]);

  useEffect(() => {
    if (!showNotifications || !currentTrack || !window.electronAPI?.showNotification) return;
    const title = currentTrack.title || "Atazuki";
    const body = currentTrack.artist || "";
    window.electronAPI.showNotification(title, body);
  }, [currentTrack, showNotifications]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const audioFiles = files.filter((f) =>
      AUDIO_EXTS.some((ext) => f.name.toLowerCase().endsWith(ext))
    );

    if (audioFiles.length === 0) {
      setSettingsMessage("Suelta archivos de audio (MP3, WAV, OGG, FLAC, etc)");
      return;
    }

    const newTracks = audioFiles.map((file) => {
      const url = URL.createObjectURL(file);
      objectUrlsRef.current.push(url);
      const name = file.name.replace(/\.[^.]+$/, "");
      return { title: name, artist: "Local", src: url, art: albumCover };
    });

    setExtraTracks((prev) => [...prev, ...newTracks]);

    if (musicSource !== "local") {
      if (audioRef.current) audioRef.current.pause();
      queuedPlayRef.current = false;
      setIsPlaying(false);
      setTrackIndex(0);
      setProgress(0);
      setCurrentTime(0);
      setDuration(0);
      setHasStartedPlayback(false);
      setMusicSource("local");
    }

    setSettingsMessage(`${audioFiles.length} archivo(s) agregados`);
  }, [musicSource]);

  function extractPlaylistId(url) {
    try {
      const parsed = new URL(url);
      let id = parsed.searchParams.get("list");
      if (id) return id.replace(/^VL/, "");
      const match = parsed.pathname.match(/\/playlist\/([^/]+)/);
      if (match) return match[1].replace(/^VL/, "");
      const browseMatch = parsed.pathname.match(/\/browse\/(VL.+)/);
      if (browseMatch) return browseMatch[1].replace(/^VL/, "");
      return null;
    } catch {
      return null;
    }
  }

  const handleLoadYoutubePlaylist = useCallback(async () => {
    const rawUrl = 
youtubeUrlInput.trim();
    if (!rawUrl) return;

    
setYoutubeLoading(true);
    setSettingsMessage("");

    try {
      let entries;
      try {
        if (!window.electronAPI?.youtubeFetchPlaylist) throw new Error("no electron");
        entries = await window.electronAPI.youtubeFetchPlaylist(rawUrl);
      } catch (ytdlpError) {
        const playlistId = extractPlaylistId(rawUrl);
        if (!playlistId) throw new Error(
          "No se pudo cargar la playlist. Verifica que la URL sea correcta.",
          { cause: ytdlpError }
        );

        if (!
youtubeConnected) throw new Error(
          "La playlist requiere autenticacion. Ve a ajustes > Login YT para conectarte.",
          { cause: ytdlpError }
        );

        const apiEntries = [];
        let pageToken = undefined;
        do {
          const data = await 
youtubeApi("/playlistItems", {
            part: "snippet,contentDetails",
            playlistId,
            maxResults: "50",
            ...(pageToken ? { pageToken } : {}),
          });
          (data.items || []).forEach((item) => {
            const videoId = item.contentDetails?.videoId;
            if (!videoId) return;
            const snippet = item.snippet || {};
            if (snippet.title === "Private video" || snippet.title === "Deleted video") return;
            apiEntries.push({
              videoId,
              title: snippet.title || videoId,
              artist: snippet.videoOwnerChannelTitle || snippet.channelTitle || "YouTube",
              duration: null,
            });
          });
          pageToken = data.nextPageToken;
        } while (pageToken);

        if (apiEntries.length === 0) throw new Error(`La playlist (ID: ${playlistId}) esta vacia o no tiene videos accesibles. Probá pegando la URL directamente de youtube.com en vez de music.youtube.com`, { cause: ytdlpError });
        entries = apiEntries;
      }

      if (!Array.isArray(entries) || entries.length === 0) {
        setSettingsMessage("Playlist vacia o privada");
        return;
      }

      const parsedTracks = entries
        .filter((entry) => entry?.videoId)
        .map((entry) => ({
          title: entry.title || entry.videoId,
          artist: entry.artist || "YouTube",
          art: `https://i.ytimg.com/vi/${entry.videoId}/mqdefault.jpg`,
          videoId: entry.videoId,
        }));

      if (parsedTracks.length === 0) {
        setSettingsMessage("No se encontraron tracks validos");
        return;
      }

      if (audioRef.current) audioRef.current.pause();
      queuedPlayRef.current = false;
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      setDuration(0);
      setHasStartedPlayback(false);
      setTrackIndex(0);
      
setYoutubeTracks(parsedTracks);
      setMusicSource("youtube");
      setSettingsMessage(`Playlist cargada: ${parsedTracks.length} tracks`);
    } catch (error) {
      setSettingsMessage(error?.message || "Error cargando playlist de YouTube");
    } finally {
      
setYoutubeLoading(false);
    }
  }, [
youtubeUrlInput, 
youtubeConnected, 
youtubeApi, 
setYoutubeLoading, 
setYoutubeTracks]);

  const handleLoadYouTubePlaylistById = useCallback(async (playlistId) => {
    
setYoutubeLoading(true);
    setSettingsMessage("");

    try {
      const tracksFromPlaylist = [];
      let pageToken = undefined;

      do {
        const data = await 
youtubeApi("/playlistItems", {
          part: "snippet,contentDetails",
          playlistId,
          maxResults: "50",
          ...(pageToken ? { pageToken } : {}),
        });

        (data.items || []).forEach((item) => {
          const videoId = item.contentDetails?.videoId;
          if (!videoId) return;
          const snippet = item.snippet || {};
          if (snippet.title === "Private video" || snippet.title === "Deleted video") return;
          tracksFromPlaylist.push({
            title: snippet.title || videoId,
            artist: snippet.videoOwnerChannelTitle || snippet.channelTitle || "YouTube",
            art: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
            videoId,
          });
        });

        pageToken = data.nextPageToken;
      } while (pageToken);

      if (tracksFromPlaylist.length === 0) {
        setSettingsMessage("Playlist vacia o sin videos reproducibles");
        return;
      }

      if (audioRef.current) audioRef.current.pause();
      queuedPlayRef.current = false;
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      setDuration(0);
      setHasStartedPlayback(false);
      setTrackIndex(0);
      
setYoutubeTracks(tracksFromPlaylist);
      setMusicSource("youtube");
      setSettingsMessage(`Playlist privada cargada: ${tracksFromPlaylist.length} tracks`);
    } catch (error) {
      setSettingsMessage(error?.message || "No se pudo cargar playlist privada");
    } finally {
      
setYoutubeLoading(false);
    }
  }, [
youtubeApi, 
setYoutubeLoading, 
setYoutubeTracks]);

  const handleYoutubeLogin = useCallback(async () => {
    const msg = await 
handleYouTubeLogin();
    setSettingsMessage(msg);
  }, [
handleYouTubeLogin]);

  const handleYoutubeLogout = useCallback(() => {
    const msg = 
handleYouTubeLogout();
    setSettingsMessage(msg);
  }, [
handleYouTubeLogout]);

  const handleYoutubeSync = useCallback(async () => {
    const msg = await 
loadYouTubePlaylists();
    setSettingsMessage(msg);
  }, [
loadYouTubePlaylists]);

  const handleMomorritaContinue = useCallback(() => {
    if (dontShowAgain) {
      localStorage.setItem("atazuki_letter_dismissed", "true");
      setShowPopup(false);
    } else {
      setPopupView("selector");
    }
  }, [dontShowAgain]);

  const handleOpenLetter = useCallback(() => {
    setShowPopup(true);
    setPopupView("selector");
  }, []);

  return (
    <ErrorBoundary>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          height: "100vh",
          background: currentTheme.bg,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          transition: "0.4s",
        }}
      >
        <div
          style={{
            position: "relative",
            width: `${292 * SCALE}px`,
            height: `${472 * SCALE}px`,
            transformOrigin: "center",
          }}
        >
          <img
            src={deviceFrame}
            style={{
              position: "absolute",
              width: `${292 * SCALE}px`,
              top: 0,
              left: 0,
              zIndex: 1,
            }}
          />

          <img
            src={scene}
            style={{
              position: "absolute",
              width: `${292 * SCALE}px`,
              top: 0,
              left: 0,
              zIndex: 2,
            }}
          />

          <TitleBar
            onMinimize={handleMinimize}
            onToggleWindow={handleToggleWindow}
            onClose={handleCloseWindow}
            onToggleSettings={() => setShowSettings((prev) => !prev)}
            onOpenLetter={handleOpenLetter}
          />

          <SettingsPanel
            show={showSettings}
            theme={theme}
            currentTheme={currentTheme}
            musicSource={musicSource}
            youtubeClientId={
youtubeClientId}
            youtubeClientSecret={
youtubeClientSecret}
            youtubeConnected={
youtubeConnected}
            youtubeAuthLoading={
youtubeAuthLoading}
            youtubeLoading={
youtubeLoading}
            youtubePlaylistsLoading={
youtubePlaylistsLoading}
            youtubePlaylists={
youtubePlaylists}
            youtubeChannelName={
youtubeChannelName}
            youtubeUrlInput={
youtubeUrlInput}
            youtubeTracks={
youtubeTracks}
            showNotifications={showNotifications}
            settingsMessage={settingsMessage}
            onChangeTheme={setTheme}
            onToggleNotifications={() => setShowNotifications((prev) => !prev)}
            onSwitchSource={switchMusicSource}
            onYoutubeClientIdChange={
setYoutubeClientId}
            onYoutubeClientSecretChange={
setYoutubeClientSecret}
            onYoutubeLogin={handleYoutubeLogin}
            onYoutubeLogout={handleYoutubeLogout}
            onYoutubeSync={handleYoutubeSync}
            onYoutubeUrlChange={
setYoutubeUrlInput}
            onYoutubeUrlLoad={handleLoadYoutubePlaylist}
            onLoadPrivatePlaylist={handleLoadYouTubePlaylistById}
          />

          <CassetteAnimation
            isPlaying={isPlaying}
            hasStartedPlayback={hasStartedPlayback}
            showChangeAnimation={showChangeAnimation}
            changeFrameIndex={changeFrameIndex}
          />

          <PlayerControls
            isPlaying={isPlaying}
            isShuffle={isShuffle}
            currentTrack={currentTrack}
            progressColor={currentTheme.progress}
            onTogglePlay={togglePlay}
            onPrevious={() => handleTrackChange(-1)}
            onNext={() => handleTrackChange(1)}
            onToggleShuffle={() => setIsShuffle((prev) => !prev)}
          />

          <VolumeControl
            volume={volume}
            isMuted={isMuted}
            showVolumeBar={showVolumeBar}
            volumeBarRef={volumeBarRef}
            onToggleMute={toggleMute}
            onVolumeChange={handleVolumeChange}
            onMouseEnter={() => setShowVolumeBar(true)}
            onMouseLeave={() => { if (!isVolumeDragging) setShowVolumeBar(false); }}
            onMouseDown={handleVolumeDragStart}
          />

          <ProgressBar
            progress={progress}
            currentTime={currentTime}
            duration={duration}
            progressColor={currentTheme.progress}
            onSeek={handleSeek}
            formatTime={formatTime}
          />

          <audio
            ref={audioRef}
            src={resolvedSrc || undefined}
            onTimeUpdate={updateProgress}
            onEnded={() => {
              if (tracks.length > 1) {
                handleTrackChange(1);
                return;
              }
              setIsPlaying(false);
            }}
            onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
          />

          <LetterPopup
            show={showPopup}
            popupView={popupView}
            dontShowAgain={dontShowAgain}
            currentTheme={currentTheme}
            pixelButtonStyle={PIXEL_BUTTON}
            onClose={() => setShowPopup(false)}
            onSelectLetter={setPopupView}
            onBackToSelector={() => setPopupView("selector")}
            onContinue={handleMomorritaContinue}
            onDontShowAgainChange={setDontShowAgain}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
