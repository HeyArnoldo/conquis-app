/**
 * Standalone script: Applies public-read bucket policy to MinIO.
 * Use this to fix 403 AccessDenied without re-uploading files.
 *
 * Usage:
 *   npx ts-node --esm src/seeds/fix-minio-policy.ts
 *
 * Environment: same as upload-to-minio.ts (MINIO_ENDPOINT, MINIO_PORT, etc.)
 */
import * as Minio from 'minio';

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'localhost';
const MINIO_PORT = parseInt(process.env.MINIO_PORT || '9000', 10);
const MINIO_USE_SSL = process.env.MINIO_USE_SSL === 'true';
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'minioadmin';
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'minioadmin';
const BUCKET_NAME = process.env.MINIO_BUCKET || 'conquis-files';

async function fixPolicy() {
  console.log(`MinIO endpoint: ${MINIO_ENDPOINT}:${MINIO_PORT}`);
  console.log(`Target bucket: ${BUCKET_NAME}`);

  const client = new Minio.Client({
    endPoint: MINIO_ENDPOINT,
    port: MINIO_PORT,
    useSSL: MINIO_USE_SSL,
    accessKey: MINIO_ACCESS_KEY,
    secretKey: MINIO_SECRET_KEY,
  });

  const exists = await client.bucketExists(BUCKET_NAME);
  if (!exists) {
    console.error(`Bucket "${BUCKET_NAME}" does not exist. Nothing to fix.`);
    process.exit(1);
  }

  // Show current policy (if any)
  try {
    const current = await client.getBucketPolicy(BUCKET_NAME);
    console.log('Current policy:', current);
  } catch {
    console.log('No existing policy found.');
  }

  // Apply public-read policy
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
  console.log('Public-read policy applied successfully.');

  // Verify by reading it back
  const applied = await client.getBucketPolicy(BUCKET_NAME);
  console.log('Verified policy:', applied);
}

fixPolicy().catch((err) => {
  console.error('Fix policy failed:', err);
  process.exit(1);
});
