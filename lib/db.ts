import mysql from 'mysql2/promise';

const databaseUrl = process.env.DATABASE_URL;

const pool = mysql.createPool(
  databaseUrl
    ? { uri: databaseUrl }
    : {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      },
);

export async function query<T = unknown>(sql: string, params: Array<unknown> = []): Promise<T[]> {
  const [rows] = await pool.query(sql, params);
  return rows as T[];
}

export async function execute<T = unknown>(
  sql: string,
  params: Array<unknown> = [],
): Promise<T> {
  const [result] = await pool.execute(sql, params);
  return result as T;
}

export { pool };
