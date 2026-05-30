import pool from '../../database/mysql.js'
import PerfilRepository from '../repositories/perfil.repository.js'
import HabilidadesRepository from '../repositories/habilidades.repository.js'
import UsuariosRepository from '../repositories/usuarios.repository.js'

class PerfilService {

    async getPerfil(usuarioId) {
        const perfil = await PerfilRepository.findPerfilCompleto(usuarioId)
        if (!perfil) {
            throw { status: 404, mensagem: 'Perfil não encontrado' }
        }
        return perfil
    }

    async updatePerfil(usuarioId, dados) {
        console.log('dados recebidos no service:', dados)

        // Busca os dados atuais do banco
        const perfilAtual = await PerfilRepository.findPerfilCompleto(usuarioId)
        if (!perfilAtual) {
            throw { status: 404, mensagem: 'Perfil não encontrado' }
        }
    
        // Usa o valor enviado ou mantém o que já está no banco
        const nome     = (typeof dados.nome === 'string' ? dados.nome.trim() : '') || perfilAtual.nome
        const email    = (typeof dados.email === 'string' ? dados.email.trim().toLowerCase() : '') || perfilAtual.email
        const ra       = (typeof dados.ra === 'string' ? dados.ra.trim().replace(/\D/g, '') : '') || perfilAtual.ra
        const bio      = typeof dados.bio === 'string' ? dados.bio.trim() : null
        const linkedin = typeof dados.linkedin === 'string' ? dados.linkedin.trim() : null
        const github   = typeof dados.github === 'string' ? dados.github.trim() : null
        const telefone = typeof dados.telefone === 'string' ? dados.telefone.trim() : null
    
        // Valida email duplicado só se mudou
        if (email !== perfilAtual.email) {
            const emailExistente = await UsuariosRepository.findByEmail(email)
            if (emailExistente && emailExistente.id !== usuarioId) {
                throw { status: 400, mensagem: 'Email já cadastrado' }
            }
        }
    
        // Valida RA duplicado só se mudou
        if (ra !== perfilAtual.ra) {
            if (ra.length !== 10) {
                throw { status: 400, mensagem: 'RA inválido — deve conter 10 dígitos' }
            }
            const raExistente = await UsuariosRepository.findByRA(ra)
            if (raExistente && raExistente.usuario_id !== usuarioId) {
                throw { status: 400, mensagem: 'RA já cadastrado' }
            }
        }
    
        const connection = await pool.getConnection()
            try {
                await connection.beginTransaction()
                console.log('transaction iniciada')
                
                await PerfilRepository.updatePerfil(
                    usuarioId,
                    { nome, email, ra, bio, linkedin, github, telefone },
                    connection
                )
                console.log('updatePerfil ok')
                
                await connection.commit()
                console.log('commit ok')
                
            } catch (error) {
                console.error('ERRO NO SERVICE TRANSACTION:', error.message)
                await connection.rollback()
                throw error
            } finally {
                connection.release()
            }
    }

    async getHabilidades(usuarioId) {
        return PerfilRepository.findHabilidadesByUsuario(usuarioId)
    }

    async updateHabilidades(usuarioId, habilidadeIds) {
        if (!Array.isArray(habilidadeIds)) {
            throw { status: 400, mensagem: 'habilidadeIds deve ser um array' }
        }

        const idsUnicos = [...new Set(
            habilidadeIds
                .map((id) => Number(id))
                .filter((id) => Number.isInteger(id) && id > 0)
        )]

        if (idsUnicos.length > 0) {
            const todas = await HabilidadesRepository.findAll()
            const idsValidos = new Set(todas.map((h) => h.id))
            const invalido = idsUnicos.find((id) => !idsValidos.has(id))

            if (invalido !== undefined) {
                throw { status: 400, mensagem: 'Uma ou mais habilidades são inválidas' }
            }
        }

        const connection = await pool.getConnection()

        try {
            await connection.beginTransaction()
            await PerfilRepository.deleteHabilidadesByUsuario(usuarioId, connection)
            await PerfilRepository.insertHabilidades(usuarioId, idsUnicos, connection)
            await connection.commit()
        } catch (error) {
            await connection.rollback()
            throw error
        } finally {
            connection.release()
        }

        return PerfilRepository.findHabilidadesByUsuario(usuarioId)
    }
}

export default new PerfilService()
