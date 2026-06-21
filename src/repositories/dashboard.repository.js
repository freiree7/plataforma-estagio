import pool from '../../database/mysql.js'

class DashboardRepository {

    async getMetricasEmpresa(empresaId) {
        const [vagas] = await pool.execute(
            `SELECT
                COUNT(*) AS total_vagas,
                SUM(CASE WHEN status = 'ativa' THEN 1 ELSE 0 END) AS vagas_ativas,
                SUM(CASE WHEN status = 'encerrada' THEN 1 ELSE 0 END) AS vagas_encerradas
             FROM vagas
             WHERE empresa_id = ?`,
            [empresaId]
        )

        const [candidaturas] = await pool.execute(
            `SELECT
                COUNT(*) AS total_candidaturas,
                SUM(CASE WHEN c.status = 'pendente'  THEN 1 ELSE 0 END) AS pendentes,
                SUM(CASE WHEN c.status = 'aprovado'  THEN 1 ELSE 0 END) AS aprovados,
                SUM(CASE WHEN c.status = 'rejeitado' THEN 1 ELSE 0 END) AS rejeitados
             FROM candidaturas c
             JOIN vagas v ON v.id = c.vaga_id
             WHERE v.empresa_id = ?`,
            [empresaId]
        )

        const [candidatosPorVaga] = await pool.execute(
            `SELECT
                v.titulo,
                COUNT(c.id) AS total
             FROM vagas v
             LEFT JOIN candidaturas c ON c.vaga_id = v.id
             WHERE v.empresa_id = ?
             GROUP BY v.id, v.titulo
             ORDER BY total DESC
             LIMIT 8`,
            [empresaId]
        )

        return {
            vagas: vagas[0],
            candidaturas: candidaturas[0],
            candidatosPorVaga
        }
    }
}

export default new DashboardRepository()
