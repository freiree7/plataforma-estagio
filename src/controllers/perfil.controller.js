import PerfilService from '../services/perfil.service.js'

class PerfilController {

    async getPerfil(req, res) {
        try {
            const perfil = await PerfilService.getPerfil(req.usuario.id)
            return res.status(200).json(perfil)
        } catch (error) {
            const status = error.status || 500
            const mensagem = error.mensagem || 'Erro no servidor'
            return res.status(status).json({ erro: mensagem })
        }
    }

    async updatePerfil(req, res) {
        try {
            console.log('controller updatePerfil chamado')
            await PerfilService.updatePerfil(req.usuario.id, req.body)
            console.log('service ok, enviando 200')
            return res.status(200).json({ mensagem: 'Perfil atualizado com sucesso' })
        } catch (error) {
            console.error('ERRO NO CONTROLLER:', error)
            const status = error.status || 500
            const mensagem = error.mensagem || 'Erro no servidor'
            return res.status(status).json({ erro: mensagem })
        }
    }

    async getHabilidades(req, res) {
        try {
            const habilidades = await PerfilService.getHabilidades(req.usuario.id)
            return res.status(200).json(habilidades)
        } catch (error) {
            const status = error.status || 500
            const mensagem = error.mensagem || 'Erro no servidor'
            return res.status(status).json({ erro: mensagem })
        }
    }

    async updateHabilidades(req, res) {
        try {
            const { habilidadeIds } = req.body
            const habilidades = await PerfilService.updateHabilidades(
                req.usuario.id,
                habilidadeIds ?? []
            )
            return res.status(200).json(habilidades)
        } catch (error) {
            const status = error.status || 500
            const mensagem = error.mensagem || 'Erro no servidor'
            return res.status(status).json({ erro: mensagem })
        }
    }

    async updateFoto(req, res) {
        try {
            const resultado = await PerfilService.updateFoto(req.usuario.id, req.file)
            return res.status(200).json(resultado)
        } catch (error) {
            const status = error.status || 500
            const mensagem = error.mensagem || 'Erro no servidor'
            return res.status(status).json({ erro: mensagem })
        }
    }
}

export default new PerfilController()
