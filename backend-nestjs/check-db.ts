import { DataSource } from 'typeorm';

// Define connection options explicitly or cast to any when accessing specific props
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5433', 10),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgrespassword',
  database: process.env.POSTGRES_DB || 'conquis_dev',
  entities: [],
  synchronize: false,
});

async function checkConnection() {
  try {
    const options: any = dataSource.options;
    console.log('Attempting to connect to database...');
    console.log(`Host: ${options.host}`);
    console.log(`Port: ${options.port}`);
    
    await dataSource.initialize();
    console.log('✅ Connection successful!');
    
    // Check for pgvector extension
    const result = await dataSource.query("SELECT * FROM pg_extension WHERE extname = 'vector'");
    if (result.length > 0) {
      console.log('✅ pgvector extension is installed.');
    } else {
      console.log('⚠️ pgvector extension is NOT installed. Installing...');
      try {
        await dataSource.query('CREATE EXTENSION IF NOT EXISTS vector');
        console.log('✅ pgvector extension installed successfully.');
      } catch (err) {
        console.error('❌ Failed to install pgvector extension:', err);
      }
    }

    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  }
}

checkConnection();
