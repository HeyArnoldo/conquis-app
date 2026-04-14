/**
 * Seed script: Reads backend/files/cep/manifest.json and populates MongoDB
 * collections for CEP categories and specialties.
 *
 * Usage:
 *   npx ts-node --esm src/seeds/seed-cep.ts
 *
 * Environment:
 *   MONGODB_URI  - MongoDB connection string (default: mongodb://localhost:27017/conquis_dev)
 *   MANIFEST_PATH - Path to manifest.json (default: ../backend/files/cep/manifest.json)
 */
import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { join, resolve } from 'path';

// Inline schemas to avoid NestJS DI dependency
const categorySchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    pdfOrigin: { type: String },
  },
  { timestamps: true, collection: 'cep_categories' },
);

const specialtySchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    pdfPath: { type: String },
    pageStart: { type: Number },
    pageEnd: { type: Number },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
  },
  { timestamps: true, collection: 'cep_specialties' },
);

interface ManifestItem {
  codigo: string;
  nombre: string;
  pag_inicio: number;
  pag_fin: number;
  slug: string;
  pdf: string;
}

interface ManifestCategory {
  codigo_categoria: string;
  nombre_categoria: string;
  slug: string;
  pdf_origen: string;
  items: ManifestItem[];
}

interface Manifest {
  generated_at: string;
  categorias: ManifestCategory[];
}

async function seed() {
  const mongoUri =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/conquis_dev';
  const manifestPath =
    process.env.MANIFEST_PATH ||
    resolve(join(process.cwd(), '../backend/files/cep/manifest.json'));

  console.log(`Connecting to MongoDB: ${mongoUri}`);
  await mongoose.connect(mongoUri);
  console.log('Connected.');

  const CategoryModel = mongoose.model('Category', categorySchema);
  const SpecialtyModel = mongoose.model('Specialty', specialtySchema);

  // Read manifest
  console.log(`Reading manifest: ${manifestPath}`);
  const raw = readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(raw) as Manifest;
  console.log(
    `Found ${manifest.categorias.length} categories, generated at ${manifest.generated_at}`,
  );

  // Clear existing data (idempotent re-seed)
  console.log('Clearing existing CEP data...');
  await SpecialtyModel.deleteMany({});
  await CategoryModel.deleteMany({});

  let totalSpecialties = 0;

  for (const catData of manifest.categorias) {
    const category = await CategoryModel.create({
      code: catData.codigo_categoria,
      name: catData.nombre_categoria,
      slug: catData.slug,
      pdfOrigin: catData.pdf_origen,
    });

    const items = catData.items || [];
    if (items.length > 0) {
      const specialtyDocs = items.map((item) => ({
        code: item.codigo,
        name: item.nombre,
        slug: item.slug,
        pdfPath: item.pdf,
        pageStart: item.pag_inicio,
        pageEnd: item.pag_fin,
        category: category._id,
      }));
      await SpecialtyModel.insertMany(specialtyDocs);
      totalSpecialties += items.length;
    }

    console.log(
      `  [${catData.codigo_categoria}] ${catData.nombre_categoria}: ${items.length} specialties`,
    );
  }

  console.log(
    `\nSeed complete: ${manifest.categorias.length} categories, ${totalSpecialties} specialties`,
  );

  await mongoose.disconnect();
  console.log('Disconnected.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
