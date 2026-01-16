const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

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

const parseRgb = (value) => {
  if (!value) return null;
  const parts = value.split(',').map(item => Number.parseInt(item.trim(), 10));
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  return { r: parts[0], g: parts[1], b: parts[2] };
};

const parsePair = (value) => {
  if (!value) return null;
  const parts = value.split(',').map(item => Number.parseFloat(item.trim()));
  if (parts.length !== 2 || parts.some(Number.isNaN)) return null;
  return { x: parts[0], y: parts[1] };
};

const parseBool = (value, defaultValue = false) => {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
};

const clampChannel = (value) => Math.max(0, Math.min(255, value));

const averageColor = (colors) => {
  const total = colors.reduce((acc, item) => ({
    r: acc.r + item.r,
    g: acc.g + item.g,
    b: acc.b + item.b
  }), { r: 0, g: 0, b: 0 });
  const count = colors.length || 1;
  return {
    r: clampChannel(Math.round(total.r / count)),
    g: clampChannel(Math.round(total.g / count)),
    b: clampChannel(Math.round(total.b / count))
  };
};

const colorDistance = (c1, c2) => {
  const dr = c1.r - c2.r;
  const dg = c1.g - c2.g;
  const db = c1.b - c2.b;
  return Math.sqrt((dr * dr) + (dg * dg) + (db * db));
};

const getPixel = (data, width, x, y) => {
  const idx = (y * width + x) * 4;
  return { r: data[idx], g: data[idx + 1], b: data[idx + 2], a: data[idx + 3] };
};

const setAlpha = (data, width, x, y, alpha) => {
  const idx = (y * width + x) * 4;
  data[idx + 3] = alpha;
};

const findBounds = (data, width, height) => {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4 + 3;
      if (data[idx] > 0) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return null;
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1
  };
};

const run = async () => {
  const args = parseArgs();
  const inputPath = args.in;
  const outPath = args.out;
  const tolerance = Number.parseFloat(args.tolerance || '30');
  const crop = (args.crop || 'true').toLowerCase() !== 'false';
  const bgColor = parseRgb(args.bg);
  const ellipse = parseBool(args.ellipse, false);
  const padding = Number.parseFloat(args.padding || '0');
  const center = parsePair(args.center);

  if (!inputPath || !outPath) {
    console.error('Uso: node remove-bg.js --in <ruta.png> --out <ruta.png> [--tolerance 30] [--crop true|false] [--bg r,g,b] [--ellipse true|false] [--padding 0] [--center x,y]');
    process.exit(1);
  }

  const image = await loadImage(inputPath);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, image.width, image.height);
  const { data } = imageData;

  const sampledBg = bgColor || averageColor([
    getPixel(data, image.width, 0, 0),
    getPixel(data, image.width, image.width - 1, 0),
    getPixel(data, image.width, 0, image.height - 1),
    getPixel(data, image.width, image.width - 1, image.height - 1)
  ]);

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const pixel = getPixel(data, image.width, x, y);
      const distance = colorDistance(pixel, sampledBg);
      if (distance <= tolerance) {
        setAlpha(data, image.width, x, y, 0);
      }
    }
  }

  if (ellipse) {
    const cx = center ? center.x : (image.width / 2);
    const cy = center ? center.y : (image.height / 2);
    const rx = Math.max(1, (image.width / 2) - padding);
    const ry = Math.max(1, (image.height / 2) - padding);
    const rx2 = rx * rx;
    const ry2 = ry * ry;

    for (let y = 0; y < image.height; y += 1) {
      const dy = y - cy;
      for (let x = 0; x < image.width; x += 1) {
        const dx = x - cx;
        const inside = ((dx * dx) / rx2) + ((dy * dy) / ry2) <= 1;
        if (!inside) {
          setAlpha(data, image.width, x, y, 0);
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  let outputCanvas = canvas;
  if (crop) {
    const bounds = findBounds(data, image.width, image.height);
    if (bounds) {
      outputCanvas = createCanvas(bounds.width, bounds.height);
      const outCtx = outputCanvas.getContext('2d');
      outCtx.drawImage(canvas, bounds.x, bounds.y, bounds.width, bounds.height, 0, 0, bounds.width, bounds.height);
    }
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, outputCanvas.toBuffer('image/png'));
  console.log(`Fondo removido en ${outPath}`);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
