import EmpresaService from '../services/empresa.service.js'

class EmpresaController {

    async getPerfil(req, res) {
        try {
            const perfil = await EmpresaService.getPerfil(req.usuario.id)
            return res.status(200).json(perfil)
        } catch (error) {
            const status = error.status || 500
            const mensagem = error.mensagem || 'Erro no servidor'
            return res.status(status).json({ erro: mensagem })
        }
    }

    async updatePerfil(req, res) {
        try {
            await EmpresaService.updatePerfil(req.usuario.id, req.body)
            return res.status(200).json({ mensagem: 'Perfil atualizado com sucesso' })
        } catch (error) {
            const status = error.status || 500
            const mensagem = error.mensagem || 'Erro no servidor'
            return res.status(status).json({ erro: mensagem })
        }
    }

    async updateLogo(req, res) {
        try {
            const resultado = await EmpresaService.updateLogo(req.usuario.id, req.file)
            return res.status(200).json(resultado)
        } catch (error) {
            const status = error.status || 500
            const mensagem = error.mensagem || 'Erro no servidor'
            return res.status(status).json({ erro: mensagem })
        }
    }
}

export default new EmpresaController()
