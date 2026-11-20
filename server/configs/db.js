import { neon } from '@neondatabase/serverless';

const sql = neon(`${process.env.DATABASE_URL}`);

export const initDB = async () => {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS creations (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        prompt TEXT NOT NULL,
        content TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        publish BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("[Database] 'creations' table is ready.");
  } catch (error) {
    console.error("[Database] Initialization error:", error.message);
  }
};

export default sql;
