const fs = require('fs');
const path = require('path');
const { createCanvas } = require('@napi-rs/canvas');

const defaultCrop = {
  x: 0.055,
  y: 0.12,
  width: 0.2,
  height: 0.2
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const config = {};
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.replace(/^--/, '');
    const value = args[i + 1];
    config[key] = value;
    i += 1;
  }
  return config;
};

const clampCrop = (crop) => ({
  x: Math.max(0, Math.min(1, crop.x)),
  y: Math.max(0, Math.min(1, crop.y)),
  width: Math.max(0, Math.min(1, crop.width)),
  height: Math.max(0, Math.min(1, crop.height))
});

const parseCrop = (value) => {
  if (!value) return defaultCrop;
  const parts = value.split(',').map(item => Number.parseFloat(item.trim()));
  if (parts.length !== 4 || parts.some(Number.isNaN)) {
    return defaultCrop;
  }
  return clampCrop({
    x: parts[0],
    y: parts[1],
    width: parts[2],
    height: parts[3]
  });
};

const run = async () => {
  const args = parseArgs();
  const pdfPath = args.pdf;
  const outPath = args.out;
  const scale = Number.parseFloat(args.scale || '2');

  if (!pdfPath || !outPath) {
    console.error('Uso: node extract-logo.js --pdf <ruta.pdf> --out <ruta.png> [--crop x,y,w,h] [--scale 2]');
    process.exit(1);
  }

  const crop = parseCrop(args.crop);
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale });

  const canvas = createCanvas(viewport.width, viewport.height);
  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport }).promise;

  const cropX = Math.round(viewport.width * crop.x);
  const cropY = Math.round(viewport.height * crop.y);
  const cropW = Math.round(viewport.width * crop.width);
  const cropH = Math.round(viewport.height * crop.height);

  const outCanvas = createCanvas(cropW, cropH);
  const outCtx = outCanvas.getContext('2d');
  outCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, outCanvas.toBuffer('image/png'));
  console.log(`Logo recortado en ${outPath}`);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
