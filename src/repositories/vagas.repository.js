import pool from '../../database/mysql.js'

function parseIdList(valor) {
    if (valor == null || valor === '') return []
    if (Array.isArray(valor)) return valor.map(Number)
    return String(valor)
        .split(',')
        .map((id) => Number(id.trim()))
        .filter((id) => Number.isInteger(id) && id > 0)
}

class VagasRepository {

    async create(
        { titulo, descricao, diferenciais, empresa_id, localizacao, tipo, status, bolsa, prazo_inscricao },
        habilidades,
        connection = pool
    ) {
        const [result] = await connection.execute(
            `INSERT INTO vagas
                (titulo, descricao, diferenciais, empresa_id, localizacao, tipo, status, bolsa, prazo_inscricao)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                titulo,
                descricao,
                diferenciais ?? null,
                empresa_id,
                localizacao ?? null,
                tipo ?? null,
                status ?? 'ativa',
                bolsa ?? null,
                prazo_inscricao ?? null
            ]
        )

        const vagaId = result.insertId

        for (const hab of habilidades) {
            await connection.execute(
                `INSERT INTO vaga_habilidades (vaga_id, habilidade_id, nivel)
                 VALUES (?, ?, ?)`,
                [vagaId, hab.id, hab.nivel]
            )
        }

        return vagaId
    }

    async findAtivas() {
        const sql = `
            SELECT
                v.*,
                e.nome_fantasia,
                u.nome AS nome_empresa,
                (
                    SELECT GROUP_CONCAT(vh.habilidade_id)
                    FROM vaga_habilidades vh
                    WHERE vh.vaga_id = v.id AND vh.nivel = 'obrigatorio'
                ) AS habilidades_obrigatorias_ids
            FROM vagas v
            JOIN usuarios u ON u.id = v.empresa_id
            LEFT JOIN empresas e ON e.usuario_id = v.empresa_id
            WHERE v.status = 'ativa'
            ORDER BY v.criado_em DESC
        `
        const [rows] = await pool.execute(sql)
        return rows.map((row) => ({
            ...row,
            habilidades_obrigatorias_ids: parseIdList(row.habilidades_obrigatorias_ids)
        }))
    }

    async findByEmpresa(empresaId) {
        const sql = `
            SELECT
                v.*,
                (
                    SELECT COUNT(*)
                    FROM candidaturas c
                    WHERE c.vaga_id = v.id
                ) AS total_candidatos
            FROM vagas v
            WHERE v.empresa_id = ?
            ORDER BY v.criado_em DESC
        `
        const [rows] = await pool.execute(sql, [empresaId])
        return rows
    }

    async findResumoById(id) {
        const [rows] = await pool.execute(
            `SELECT id, empresa_id, status, titulo FROM vagas WHERE id = ?`,
            [id]
        )
        return rows[0] || null
    }

    async findById(id) {
        const sqlVaga = `
            SELECT
                v.*,
                e.nome_fantasia,
                u.nome AS nome_empresa
            FROM vagas v
            JOIN usuarios u ON u.id = v.empresa_id
            LEFT JOIN empresas e ON e.usuario_id = v.empresa_id
            WHERE v.id = ?
        `
        const [vagas] = await pool.execute(sqlVaga, [id])
        if (vagas.length === 0) return null

        const sqlHabilidades = `
            SELECT
                h.id,
                h.nome,
                h.categoria,
                vh.nivel
            FROM vaga_habilidades vh
            JOIN habilidades h ON h.id = vh.habilidade_id
            WHERE vh.vaga_id = ?
            ORDER BY vh.nivel, h.nome
        `
        const [habilidades] = await pool.execute(sqlHabilidades, [id])

        return { ...vagas[0], habilidades }
    }

    async update(
        vagaId,
        empresaId,
        { titulo, descricao, diferenciais, localizacao, tipo, status, bolsa, prazo_inscricao },
        habilidades
    ) {
        const connection = await pool.getConnection()

        try {
            await connection.beginTransaction()

            const [result] = await connection.execute(
                `UPDATE vagas SET titulo=?, descricao=?, diferenciais=?,
                 localizacao=?, tipo=?, status=?, bolsa=?, prazo_inscricao=?
                 WHERE id=? AND empresa_id=?`,
                [
                    titulo,
                    descricao,
                    diferenciais ?? null,
                    localizacao ?? null,
                    tipo ?? null,
                    status ?? 'ativa',
                    bolsa ?? null,
                    prazo_inscricao ?? null,
                    vagaId,
                    empresaId
                ]
            )

            if (result.affectedRows === 0) {
                await connection.rollback()
                return false
            }

            await connection.execute(
                'DELETE FROM vaga_habilidades WHERE vaga_id = ?',
                [vagaId]
            )

            for (const hab of habilidades) {
                await connection.execute(
                    'INSERT INTO vaga_habilidades (vaga_id, habilidade_id, nivel) VALUES (?, ?, ?)',
                    [vagaId, hab.id, hab.nivel]
                )
            }

            await connection.commit()
            return true
        } catch (error) {
            await connection.rollback()
            throw error
        } finally {
            connection.release()
        }
    }

    async delete(vagaId, empresaId) {
        const [result] = await pool.execute(
            `DELETE FROM vagas WHERE id = ? AND empresa_id = ?`,
            [vagaId, empresaId]
        )
        return result.affectedRows > 0
    }
}

export default new VagasRepository()
