import pool from '../../database/mysql.js'

function parseIdList(valor) {
    if (valor == null || valor === '') return []
    if (Array.isArray(valor)) return valor.map(Number)
    return String(valor)
        .split(',')
        .map((id) => Number(id.trim()))
        .filter((id) => Number.isInteger(id) && id > 0)
}

class CandidaturasRepository {

    async findByAlunoEVaga(usuarioId, vagaId) {
        const [rows] = await pool.execute(
            `SELECT * FROM candidaturas WHERE usuario_id = ? AND vaga_id = ?`,
            [usuarioId, vagaId]
        )
        return rows[0] || null
    }

    async create(usuarioId, vagaId, mensagem) {
        const [result] = await pool.execute(
            `INSERT INTO candidaturas (usuario_id, vaga_id, mensagem) VALUES (?, ?, ?)`,
            [usuarioId, vagaId, mensagem ?? null]
        )
        return result.insertId
    }

    async findByVaga(vagaId) {
        const sql = `
            SELECT
                c.*,
                u.nome,
                u.email,
                a.ra,
                p.bio,
                p.github,
                p.linkedin,
                p.telefone,
                p.foto_url,
                (
                    SELECT GROUP_CONCAT(uh.habilidade_id)
                    FROM usuario_habilidades uh
                    WHERE uh.usuario_id = c.usuario_id
                ) AS habilidades_candidato_ids
            FROM candidaturas c
            JOIN usuarios u ON u.id = c.usuario_id
            LEFT JOIN alunos a ON a.usuario_id = c.usuario_id
            LEFT JOIN perfis p ON p.usuario_id = c.usuario_id
            WHERE c.vaga_id = ?
            ORDER BY c.criado_em DESC
        `
        const [rows] = await pool.execute(sql, [vagaId])
        return rows.map((row) => ({
            ...row,
            habilidades_candidato_ids: parseIdList(row.habilidades_candidato_ids)
        }))
    }

    async findByAluno(usuarioId) {
        const sql = `
            SELECT
                c.*,
                v.titulo,
                v.tipo,
                v.bolsa,
                COALESCE(e.nome_fantasia, u.nome) AS nome_empresa
            FROM candidaturas c
            JOIN vagas v ON v.id = c.vaga_id
            JOIN usuarios u ON u.id = v.empresa_id
            LEFT JOIN empresas e ON e.usuario_id = v.empresa_id
            WHERE c.usuario_id = ?
            ORDER BY c.criado_em DESC
        `
        const [rows] = await pool.execute(sql, [usuarioId])
        return rows
    }

    async findById(id) {
        const [rows] = await pool.execute(
            `SELECT * FROM candidaturas WHERE id = ?`,
            [id]
        )
        return rows[0] || null
    }

    async updateStatus(candidaturaId, vagaId, empresaId, status) {
        const [result] = await pool.execute(
            `UPDATE candidaturas c
             INNER JOIN vagas v ON v.id = c.vaga_id
             SET c.status = ?
             WHERE c.id = ? AND c.vaga_id = ? AND v.empresa_id = ?`,
            [status, candidaturaId, vagaId, empresaId]
        )
        return result.affectedRows > 0
    }
}

export default new CandidaturasRepository()
