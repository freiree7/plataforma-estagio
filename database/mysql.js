import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
})

async function testarConexao() {
  try {
    const connection = await pool.getConnection();
    console.log("MySQL conectado com sucesso");
    connection.release();
  } catch (error) {
    console.error("Erro ao conectar no MySQL:", error.message);
    process.exit(1); 
  }
}

testarConexao();

export default pool;
