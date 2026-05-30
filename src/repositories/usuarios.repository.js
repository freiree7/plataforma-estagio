import pool from '../../database/mysql.js'

class UsuariosRepository {

    async findByEmail(email) {
        const sql = `
            SELECT u.id, u.nome, u.email, u.senha, u.tipo, a.ra, e.cnpj
            FROM usuarios u
            LEFT JOIN alunos a ON a.usuario_id = u.id
            LEFT JOIN empresas e ON e.usuario_id = u.id
            WHERE u.email = ?
        `
        const [rows] = await pool.execute(sql, [email])
        return rows[0] || null
    }

    async findByIdentifier(identificador) {
      const identificadorLimpo = String(identificador || '').trim()
      const email = identificadorLimpo.toLowerCase()
      const ra = identificadorLimpo.replace(/\D/g, '')
      const cnpj = identificadorLimpo.replace(/\D/g, '')
  
      const sql = `
          SELECT u.id, u.nome, u.email, u.senha, u.tipo, a.ra, e.cnpj
          FROM usuarios u
          LEFT JOIN alunos a ON a.usuario_id = u.id
          LEFT JOIN empresas e ON e.usuario_id = u.id
          WHERE (? <> '' AND LOWER(u.email) = ?)
             OR (? <> '' AND a.ra = ?)
             OR (? <> '' AND REPLACE(REPLACE(REPLACE(e.cnpj, '.', ''), '-', ''), '/', '') = ?)
      `
      const [rows] = await pool.execute(sql, [email, email, ra, ra, cnpj, cnpj])
      return rows
  }

    async findByRA(ra) {
        const [rows] = await pool.execute(
            'SELECT usuario_id FROM alunos WHERE ra = ?',
            [ra]
        )
        return rows[0] || null
    }

    async findByCNPJ(cnpj) {
        const [rows] = await pool.execute(
            'SELECT usuario_id FROM empresas WHERE cnpj = ?',
            [cnpj]
        )
        return rows[0] || null
    }

    async create({ nome, email, senha, tipo, ra, cnpj }) {
        const connection = await pool.getConnection()
        try {
            await connection.beginTransaction()

            const [result] = await connection.execute(
                'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
                [nome, email, senha, tipo]
            )
            const usuarioId = result.insertId

            if (tipo === 'aluno') {
                await connection.execute(
                    'INSERT INTO alunos (usuario_id, ra) VALUES (?, ?)',
                    [usuarioId, ra]
                )
                await connection.execute(
                    'INSERT INTO perfis (usuario_id) VALUES (?)',
                    [usuarioId]
                )
            }

            if (tipo === 'empresa') {
                await connection.execute(
                    'INSERT INTO empresas (usuario_id, cnpj, nome_fantasia) VALUES (?, ?, ?)',
                    [usuarioId, cnpj, nome]
                )
            }

            await connection.commit()
            return usuarioId

        } catch (error) {
            await connection.rollback()
            throw error
        } finally {
            connection.release()
        }
    }
}

export default new UsuariosRepository()