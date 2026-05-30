import pool from '../../database/mysql.js'

class PerfilRepository {

    async findPerfilCompleto(usuarioId) {
        const sql = `
            SELECT
                u.id,
                u.nome,
                u.email,
                u.tipo,
                a.ra,
                p.foto_url,
                p.bio,
                p.linkedin,
                p.github,
                p.telefone
            FROM usuarios u
            LEFT JOIN alunos a ON a.usuario_id = u.id
            LEFT JOIN perfis p ON p.usuario_id = u.id
            WHERE u.id = ?
        `
        const [rows] = await pool.execute(sql, [usuarioId])
        return rows[0] || null
    }

    async updatePerfil(usuarioId, { nome, email, ra, bio, linkedin, github, telefone }, connection) {
        const conn = connection || pool
    
        await conn.execute(
            'UPDATE usuarios SET nome = ?, email = ? WHERE id = ?',
            [nome, email, usuarioId]
        )
    
        await conn.execute(
            'UPDATE alunos SET ra = ? WHERE usuario_id = ?',
            [ra, usuarioId]
        )
    
        // INSERT se não existir, UPDATE se já existir
        await conn.execute(
            `INSERT INTO perfis (usuario_id, bio, linkedin, github, telefone)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                 bio = VALUES(bio),
                 linkedin = VALUES(linkedin),
                 github = VALUES(github),
                 telefone = VALUES(telefone)`,
            [usuarioId, bio, linkedin, github, telefone]
        )
    }
    async findHabilidadesByUsuario(usuarioId) {
        const sql = `
            SELECT h.id, h.nome, h.categoria
            FROM habilidades h
            INNER JOIN usuario_habilidades uh ON uh.habilidade_id = h.id
            WHERE uh.usuario_id = ?
            ORDER BY h.categoria, h.nome
        `
        const [rows] = await pool.execute(sql, [usuarioId])
        return rows
    }

    async findHabilidadeIdsByUsuario(usuarioId) {
        const [rows] = await pool.execute(
            'SELECT habilidade_id FROM usuario_habilidades WHERE usuario_id = ?',
            [usuarioId]
        )
        return rows.map((r) => r.habilidade_id)
    }

    async deleteHabilidadesByUsuario(usuarioId, connection) {
        await connection.execute(
            'DELETE FROM usuario_habilidades WHERE usuario_id = ?',
            [usuarioId]
        )
    }

    async insertHabilidades(usuarioId, habilidadeIds, connection) {
        if (!habilidadeIds.length) {
            return
        }

        const values = habilidadeIds.map(() => '(?, ?)').join(', ')
        const params = habilidadeIds.flatMap((id) => [usuarioId, id])

        await connection.execute(
            `INSERT INTO usuario_habilidades (usuario_id, habilidade_id) VALUES ${values}`,
            params
        )
    }
}

export default new PerfilRepository()
