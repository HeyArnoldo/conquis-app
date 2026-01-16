const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

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

const walk = (dir, fileList = []) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, fileList);
      continue;
    }
    if (entry.isFile()) {
      fileList.push(fullPath);
    }
  }
  return fileList;
};

const toBool = (value) => value !== undefined && value.toLowerCase() === 'true';

const buildArgs = (options) => {
  const out = [];
  Object.entries(options).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    out.push(`--${key}`);
    out.push(String(value));
  });
  return out;
};

const run = () => {
  const args = parseArgs();
  const root = args.root || path.join('backend', 'files', 'cep');
  const ellipse = toBool(args.ellipse) || false;
  const padding = args.padding || '0';
  const tolerance = args.tolerance;
  const bg = args.bg;
  const crop = args.crop;
  const center = args.center;
  const dryRun = toBool(args['dry-run']);

  if (!fs.existsSync(root)) {
    console.error(`No existe la ruta: ${root}`);
    process.exit(1);
  }

  const scriptPath = path.join(__dirname, 'remove-bg.js');
  const files = walk(root).filter((file) => file.toLowerCase().endsWith('.png'));
  const targets = files.filter((file) => !file.toLowerCase().endsWith('-no-bg.png'));

  if (!targets.length) {
    console.log('No hay PNGs para procesar.');
    return;
  }

  console.log(`Procesando ${targets.length} archivos...`);

  for (const filePath of targets) {
    const dir = path.dirname(filePath);
    const base = path.basename(filePath, '.png');
    const outPath = path.join(dir, `${base}.png`);

    const cmdArgs = buildArgs({
      in: filePath,
      out: outPath,
      ellipse: ellipse ? 'true' : undefined,
      padding: ellipse ? padding : undefined,
      tolerance,
      bg,
      crop,
      center
    });

    if (dryRun) {
      console.log(`[dry-run] node ${scriptPath} ${cmdArgs.join(' ')}`);
      continue;
    }

    const result = spawnSync('node', [scriptPath, ...cmdArgs], { stdio: 'inherit' });
    if (result.status !== 0) {
      console.error(`Error procesando ${filePath}`);
      process.exit(result.status || 1);
    }
  }

  console.log('Listo.');
};

run();
