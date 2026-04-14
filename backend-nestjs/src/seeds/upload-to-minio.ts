/**
 * Upload script: Uploads backend/files/cep/ to MinIO bucket conquis-files
 * preserving the cep/ prefix path structure and setting content-type.
 *
 * Usage:
 *   npx ts-node --esm src/seeds/upload-to-minio.ts
 *
 * Environment:
 *   MINIO_ENDPOINT  - MinIO host (default: localhost)
 *   MINIO_PORT      - MinIO port (default: 9000)
 *   MINIO_USE_SSL   - Use SSL (default: false)
 *   MINIO_ACCESS_KEY - Access key (default: minioadmin)
 *   MINIO_SECRET_KEY - Secret key (default: minioadmin)
 *   MINIO_BUCKET    - Bucket name (default: conquis-files)
 *   CEP_FILES_DIR   - Source directory (default: ../backend/files/cep)
 */
import * as Minio from 'minio';
import { readdirSync, statSync, createReadStream } from 'fs';
import { join, resolve, relative } from 'path';
import * as mime from 'mime-types';

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'localhost';
const MINIO_PORT = parseInt(process.env.MINIO_PORT || '9000', 10);
const MINIO_USE_SSL = process.env.MINIO_USE_SSL === 'true';
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'minioadmin';
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'minioadmin';
const BUCKET_NAME = process.env.MINIO_BUCKET || 'conquis-files';
const CEP_FILES_DIR =
  process.env.CEP_FILES_DIR ||
  resolve(join(process.cwd(), '../backend/files/cep'));

function walkDir(dir: string): string[] {
  const results: string[] = [];
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...walkDir(fullPath));
    } else {
      results.push(fullPath);
    }
  }

  return results;
}

async function upload() {
  console.log(`MinIO endpoint: ${MINIO_ENDPOINT}:${MINIO_PORT}`);
  console.log(`Source directory: ${CEP_FILES_DIR}`);
  console.log(`Target bucket: ${BUCKET_NAME}`);

  const client = new Minio.Client({
    endPoint: MINIO_ENDPOINT,
    port: MINIO_PORT,
    useSSL: MINIO_USE_SSL,
    accessKey: MINIO_ACCESS_KEY,
    secretKey: MINIO_SECRET_KEY,
  });

  // Ensure bucket exists
  const bucketExists = await client.bucketExists(BUCKET_NAME);
  if (!bucketExists) {
    await client.makeBucket(BUCKET_NAME);
    console.log(`Created bucket: ${BUCKET_NAME}`);
  } else {
    console.log(`Bucket "${BUCKET_NAME}" already exists.`);
  }

  // Always apply public-read policy (idempotent).
  // Fixes 403 AccessDenied when bucket existed before policy was set.
  const policy = {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: { AWS: ['*'] },
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
      },
    ],
  };
  await client.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
  console.log('Public-read policy applied to bucket.');

  // Discover files
  const allFiles = walkDir(CEP_FILES_DIR);

  // Skip manifest.json from upload (it's metadata, not a served file)
  const filesToUpload = allFiles.filter((f) => !f.endsWith('manifest.json'));

  console.log(`Found ${filesToUpload.length} files to upload.`);

  let uploaded = 0;
  const skipped = 0;
  let errors = 0;

  for (const filePath of filesToUpload) {
    // Object key: cep/<relative-path> (forward slashes)
    const relativePath = relative(CEP_FILES_DIR, filePath).replace(/\\/g, '/');
    const objectKey = `cep/${relativePath}`;

    // Detect content type
    const contentType = mime.lookup(filePath) || 'application/octet-stream';

    try {
      const stream = createReadStream(filePath);
      const stat = statSync(filePath);

      await client.putObject(BUCKET_NAME, objectKey, stream, stat.size, {
        'Content-Type': contentType,
      });

      uploaded++;
      if (uploaded % 50 === 0) {
        console.log(`  Uploaded ${uploaded}/${filesToUpload.length}...`);
      }
    } catch (err) {
      console.error(`  ERROR uploading ${objectKey}:`, err);
      errors++;
    }
  }

  console.log(
    `\nUpload complete: ${uploaded} uploaded, ${skipped} skipped, ${errors} errors.`,
  );
}

upload().catch((err) => {
  console.error('Upload failed:', err);
  process.exit(1);
});
