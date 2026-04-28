import pool from '../database/mysql.js'

class UsuariosModel {
   async createUsuario({ nome, email, senha, tipo }) {
      const sql = 'INSERT INTO usuarios (nome,email,senha,tipo) VALUES (?,?,?,?)'
      return await pool.execute(sql, [nome, email, senha, tipo])
   }

   async readAll() {
      const sql = 'SELECT id,nome,email,tipo FROM usuarios'

      //se nao armazenar em lista e retornar diretamente a req aassincrona os metadados irão juntos
      // contribui para trabalhar com os dados do select

      const [resposta] = await pool.execute(sql)

      return resposta
   }

   async searchEmail(email) {
      const sql = 'SELECT id,nome,email,senha,tipo FROM usuarios WHERE email = ?'
      const [rows] = await pool.execute(sql, [email])
      return rows[0]
   }

   async searchAllEmail(email){
      const sql = 'SELECT id FROM usuarios WHERE email = ?'
      const [rows] = await pool.execute(sql, [email])
      return rows

   }
}

export default UsuariosModel;