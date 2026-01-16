const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const rootDir = path.join(__dirname, '../..');
const cepDir = path.join(rootDir, 'backend/files/cep');
const extractor = path.join(__dirname, 'extract-logo.js');

const crop = process.argv[2] || '0.164,0.046,0.138,0.093';

const collectPdfs = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return collectPdfs(fullPath);
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
      return [fullPath];
    }
    return [];
  });
};

const pdfs = collectPdfs(cepDir);
if (pdfs.length === 0) {
  console.log('No se encontraron PDFs en CEP.');
  process.exit(0);
}

let failures = 0;
pdfs.forEach(pdfPath => {
  const dir = path.dirname(pdfPath);
  const baseName = path.basename(pdfPath, path.extname(pdfPath));
  const outPath = path.join(dir, `${baseName}.png`);
  const args = [
    extractor,
    '--pdf',
    pdfPath,
    '--out',
    outPath,
    '--crop',
    crop
  ];
  const result = spawnSync('node', args, { stdio: 'inherit' });
  if (result.status !== 0) {
    failures += 1;
  }
});

if (failures > 0) {
  console.error(`Finalizado con ${failures} errores.`);
  process.exit(1);
}

console.log(`Listo. Procesados ${pdfs.length} PDFs.`);
