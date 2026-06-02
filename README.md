# Atazuki

Reproductor musical de escritorio con estética retro de cassette. Reproduce música local y playlists de YouTube.

## Características

- **Reproducción local**: Soporte para archivos MP3 y WAV
- **YouTube**: Carga playlists públicas y privadas (vía OAuth)
- **Streaming**: Reproduce audio de YouTube sin descargar (via yt-dlp)
- **Animaciones**: Cassette girando durante reproducción, animación de cambio de track
- **Temas**: Dos esquemas de color (Atapaz y Tema 2)
- **Atajos de teclado**: Espacio (play/pause), flechas (seek, volumen)
- **Modo aleatorio**: Reproducción shuffle

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
npm install
```

Esto descargará automáticamente yt-dlp necesario para streaming de YouTube.

## Desarrollo

```bash
npm run dev
```

## Build

```bash
npm run dist
```

Genera un ejecutable portable en la carpeta `release/`.

## Configuración YouTube (opcional)

Para playlists privadas:

1. Crea un proyecto en [Google Cloud Console](https://console.cloud.google.com/)
2. Habilita la API de YouTube Data v3
3. Crea credenciales OAuth 2.0 (tipo: aplicación de escritorio)
4. En la app, ve a ajustes > introduce Client ID y Client Secret
5. Haz login con tu cuenta de YouTube

Para playlists públicas no necesitas configuración.

## Estructura del proyecto

```
atazuki/
├── electron.js          # Main process (Electron)
├── preload.js           # Bridge IPC
├── src/
│   ├── main.jsx         # Entry point React
│   ├── App.jsx          # Componente principal
│   ├── constants.js     # Temas, dimensiones, estilos
│   ├── hooks/           # Custom hooks
│   │   ├── useYouTube.js
│   │   ├── useAudioPlayer.js
│   │   └── useKeyboard.js
│   ├── components/      # Componentes UI
│   │   ├── ErrorBoundary.jsx
│   │   ├── TitleBar.jsx
│   │   ├── CassetteAnimation.jsx
│   │   ├── VolumeControl.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── PlayerControls.jsx
│   │   ├── SettingsPanel.jsx
│   │   └── LetterPopup.jsx
│   └── assets/          # Imágenes, sonidos
├── scripts/
│   └── install-yt-dlp.cjs
└── bin/                 # yt-dlp (autodescargado)
```

## Créditos

Este proyecto está basado en **[cupid-music-player](https://github.com/cupidbity/cupid-music-player)** de [cupidbity](https://github.com/cupidbity), un reproductor musical pixel-art de escritorio construido con Electron, Vite y React. Gracias por el trabajo original que sirvió de inspiración y base para Atazuki.
