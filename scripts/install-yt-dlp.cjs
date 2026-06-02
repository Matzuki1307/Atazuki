#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const https = require("node:https");

const BIN_DIR = path.join(__dirname, "..", "bin");
const REPO = "yt-dlp/yt-dlp";

function assetForPlatform() {
  const { platform, arch } = process;
  if (platform === "darwin") return { asset: "yt-dlp_macos", outName: "yt-dlp" };
  if (platform === "linux") {
    if (arch === "arm64" || arch === "aarch64") {
      return { asset: "yt-dlp_linux_aarch64", outName: "yt-dlp" };
    }
    if (arch === "arm") return { asset: "yt-dlp_linux_armv7l", outName: "yt-dlp" };
    return { asset: "yt-dlp_linux", outName: "yt-dlp" };
  }
  if (platform === "win32") return { asset: "yt-dlp.exe", outName: "yt-dlp.exe" };
  throw new Error(`Unsupported platform: ${platform}/${arch}`);
}

function httpsGet(url, accept = "application/octet-stream") {
  return new Promise((resolve, reject) => {
    const opts = {
      headers: {
        "User-Agent": "atazuki-install-script",
        Accept: accept,
      },
    };

    https
      .get(url, opts, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          res.resume();
          httpsGet(res.headers.location, accept).then(resolve, reject);
          return;
        }
        resolve(res);
      })
      .on("error", reject);
  });
}

function download(url, dest) {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await httpsGet(url);
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} from ${url}`));
        return;
      }

      const tmp = `${dest}.partial`;
      const file = fs.createWriteStream(tmp);
      res.pipe(file);

      file.on("finish", () => {
        file.close(() => {
          fs.renameSync(tmp, dest);
          resolve();
        });
      });

      file.on("error", (error) => {
        try {
          fs.unlinkSync(tmp);
        } catch {
          // ignore
        }
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}

async function fetchLatestTag() {
  const res = await httpsGet(
    `https://api.github.com/repos/${REPO}/releases/latest`,
    "application/vnd.github+json"
  );

  if (res.statusCode !== 200) {
    throw new Error(`GitHub API returned ${res.statusCode}`);
  }

  let body = "";
  for await (const chunk of res) body += chunk;
  const data = JSON.parse(body);
  return data.tag_name;
}

async function main() {
  if (process.env.SKIP_YT_DLP_INSTALL === "1") {
    return;
  }

  const { asset, outName } = assetForPlatform();
  const dest = path.join(BIN_DIR, outName);

  try {
    const stat = fs.statSync(dest);
    const age = Date.now() - stat.mtimeMs;
    if (age < 14 * 24 * 60 * 60 * 1000) return;
  } catch {
    // continue
  }

  fs.mkdirSync(BIN_DIR, { recursive: true });

  let tag = "latest";
  try {
    tag = await fetchLatestTag();
  } catch {
    // fallback below
  }

  const url =
    tag === "latest"
      ? `https://github.com/${REPO}/releases/latest/download/${asset}`
      : `https://github.com/${REPO}/releases/download/${tag}/${asset}`;

  await download(url, dest);

  if (process.platform !== "win32") {
    fs.chmodSync(dest, 0o755);
  }
}

main().catch(() => {
  process.exit(0);
});
