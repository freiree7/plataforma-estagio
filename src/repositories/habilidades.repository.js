import pool from '../../database/mysql.js'

class HabilidadesRepository {

    async findAll() {
        const sql = `
            SELECT id, nome, categoria
            FROM habilidades
            ORDER BY categoria, nome
        `
        const [rows] = await pool.execute(sql)
        return rows
    }
}

export default new HabilidadesRepository()
