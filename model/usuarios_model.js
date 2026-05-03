import pool from '../database/mysql.js'

class UsuariosModel {
   async createUsuario({ nome, email, senha, tipo, ra, cnpj }) {
      const connection = await pool.getConnection()

      try {
         await connection.beginTransaction()

         const sqlUsuario = 'INSERT INTO usuarios (nome,email,senha,tipo) VALUES (?,?,?,?)'
         const [result] = await connection.execute(sqlUsuario, [nome, email, senha, tipo])
         const usuarioId = result.insertId

         if (tipo === 'aluno') {
            const sqlAluno = 'INSERT INTO alunos (usuario_id, ra) VALUES (?,?)'
            await connection.execute(sqlAluno, [usuarioId, ra])
         }

         if (tipo === 'empresa') {
            const sqlEmpresa = 'INSERT INTO empresas (usuario_id, cnpj) VALUES (?,?)'
            await connection.execute(sqlEmpresa, [usuarioId, cnpj])
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

   async readAll() {
      const sql = `
         SELECT
            u.id,
            u.nome,
            u.email,
            u.tipo,
            a.ra,
            e.cnpj
         FROM usuarios u
         LEFT JOIN alunos a ON a.usuario_id = u.id
         LEFT JOIN empresas e ON e.usuario_id = u.id
      `

      //se nao armazenar em lista e retornar diretamente a req aassincrona os metadados irão juntos
      // contribui para trabalhar com os dados do select

      const [resposta] = await pool.execute(sql)

      return resposta
   }

   async searchEmail(email) {
      const sql = `
         SELECT
            u.id,
            u.nome,
            u.email,
            u.senha,
            u.tipo,
            a.ra,
            e.cnpj
         FROM usuarios u
         LEFT JOIN alunos a ON a.usuario_id = u.id
         LEFT JOIN empresas e ON e.usuario_id = u.id
         WHERE u.email = ?
      `
      const [rows] = await pool.execute(sql, [email])
      return rows[0]
   }

   async searchByIdentifier(identificador) {
      const identificadorLimpo = String(identificador || '').trim()
      const email = identificadorLimpo.toLowerCase()
      const ra = identificadorLimpo.toUpperCase()
      const cnpj = identificadorLimpo.replace(/\D/g, '')
      const raSemMascara = ra.replace(/[^A-Z0-9]/g, '')

      const sql = `
         SELECT
            u.id,
            u.nome,
            u.email,
            u.senha,
            u.tipo,
            a.ra,
            e.cnpj
         FROM usuarios u
         LEFT JOIN alunos a ON a.usuario_id = u.id
         LEFT JOIN empresas e ON e.usuario_id = u.id
         WHERE (? <> '' AND LOWER(u.email) = ?)
            OR (? <> '' AND (UPPER(a.ra) = ? OR REPLACE(REPLACE(REPLACE(REPLACE(UPPER(a.ra), '.', ''), '-', ''), '/', ''), ' ', '') = ?))
            OR (? <> '' AND (e.cnpj = ? OR REPLACE(REPLACE(REPLACE(REPLACE(e.cnpj, '.', ''), '-', ''), '/', ''), ' ', '') = ?))
      `

      const [rows] = await pool.execute(sql, [email, email, ra, ra, raSemMascara, cnpj, cnpj, cnpj])
      return rows
   }

   async searchAllEmail(email){
      const sql = 'SELECT id FROM usuarios WHERE email = ?'
      const [rows] = await pool.execute(sql, [email])
      return rows

   }

   async searchRA(ra) {
      const sql = 'SELECT usuario_id FROM alunos WHERE ra = ?'
      const [rows] = await pool.execute(sql, [ra])
      return rows[0]
   }

   async searchCNPJ(cnpj) {
      const sql = 'SELECT usuario_id FROM empresas WHERE cnpj = ?'
      const [rows] = await pool.execute(sql, [cnpj])
      return rows[0]
   }
}

export default UsuariosModel;