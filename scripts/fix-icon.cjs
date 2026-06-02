const sharp = require("sharp");
const fs = require("node:fs");
const path = require("node:path");
const icojs = require("icojs");

const ICO_PATH = path.join(__dirname, "..", "src", "assets", "Atapaz", "IconoExe.ico");
const PUBLIC_PATH = path.join(__dirname, "..", "public", "IconoExe.ico");

async function main() {
  const buf = fs.readFileSync(ICO_PATH);
  const count = buf.readUInt16LE(4);
  const entryOffset = buf.readUInt32LE(6 + (count - 1) * 16 + 12);
  const entrySize = buf.readUInt32LE(6 + (count - 1) * 16 + 8);
  const srcPng = buf.slice(entryOffset, entryOffset + entrySize);

  const sizes = [16, 24, 32, 48, 64, 96, 128, 256];

  const icoData = await icojs.encodeIco(await Promise.all(sizes.map(async (size) => ({
    buffer: size === 256 ? srcPng : await sharp(srcPng).resize(size, size).png().toBuffer(),
    width: size,
    height: size,
  }))));

  fs.writeFileSync(ICO_PATH, Buffer.from(icoData));
  fs.writeFileSync(PUBLIC_PATH, Buffer.from(icoData));
  console.log(`ICO generado: ${icoData.byteLength} bytes, ${sizes.length} tamaños`);
}

main().catch((e) => { console.error(e); process.exit(1); });
