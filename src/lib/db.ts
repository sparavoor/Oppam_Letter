import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not defined. Please add it to your .env.local file.');
}

// Create connection to Neon database
const db = neon(process.env.DATABASE_URL);

// Initialize PostgreSQL database schema asynchronously
const initDb = async () => {
  try {
    // 1. Create letters table
    await db`
      CREATE TABLE IF NOT EXISTS letters (
        id SERIAL PRIMARY KEY,
        reference_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        location VARCHAR(150) NOT NULL,
        subject VARCHAR(200),
        letter_content TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Reviewed', 'Resolved')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Create users table
    await db`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 3. Seed default admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@oppam.gov.in';
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

    // Check if admin already exists to prevent duplicate key violations
    const existingUsers = await db`
      SELECT id FROM users WHERE username = ${adminUsername} OR email = ${adminEmail} LIMIT 1
    `;

    if (existingUsers.length === 0) {
      const hashedPassword = bcrypt.hashSync(adminPassword, 10);
      await db`
        INSERT INTO users (username, email, password) VALUES (${adminUsername}, ${adminEmail}, ${hashedPassword})
      `;
      console.log('Successfully seeded default admin user into Neon PostgreSQL.');
    }
  } catch (error) {
    console.error('Error initializing PostgreSQL database schema:', error);
  }
};

// Start background initialization
initDb();

export { db };
export default db;
