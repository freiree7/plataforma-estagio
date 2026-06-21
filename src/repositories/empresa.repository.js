import pool from '../../database/mysql.js'

class EmpresaRepository {

    async findPerfilCompleto(usuarioId) {
        const sql = `
            SELECT
                u.id,
                u.nome,
                u.email,
                e.cnpj,
                e.nome_fantasia,
                e.logo_url,
                e.descricao
            FROM usuarios u
            JOIN empresas e ON e.usuario_id = u.id
            WHERE u.id = ?
        `
        const [rows] = await pool.execute(sql, [usuarioId])
        return rows[0] || null
    }

    async updatePerfil(usuarioId, { nome, email, nome_fantasia, descricao }) {
        const connection = await pool.getConnection()
        try {
            await connection.beginTransaction()

            await connection.execute(
                'UPDATE usuarios SET nome = ?, email = ? WHERE id = ?',
                [nome, email, usuarioId]
            )

            await connection.execute(
                `INSERT INTO empresas (usuario_id, cnpj, nome_fantasia, descricao)
                 VALUES (?, (SELECT cnpj FROM empresas WHERE usuario_id = ?), ?, ?)
                 ON DUPLICATE KEY UPDATE
                     nome_fantasia = VALUES(nome_fantasia),
                     descricao = VALUES(descricao)`,
                [usuarioId, usuarioId, nome_fantasia, descricao]
            )

            await connection.commit()
        } catch (error) {
            await connection.rollback()
            throw error
        } finally {
            connection.release()
        }
    }

    async updateLogoUrl(usuarioId, logoUrl) {
        await pool.execute(
            `INSERT INTO empresas (usuario_id, cnpj, logo_url)
             VALUES (?, (SELECT cnpj FROM empresas e2 WHERE e2.usuario_id = ?), ?)
             ON DUPLICATE KEY UPDATE logo_url = VALUES(logo_url)`,
            [usuarioId, usuarioId, logoUrl]
        )
    }
}

export default new EmpresaRepository()
