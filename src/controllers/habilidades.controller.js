import HabilidadesService from '../services/habilidades.service.js'

class HabilidadesController {

    async listar(req, res) {
        try {
            const habilidades = await HabilidadesService.listar()
            return res.status(200).json(habilidades)
        } catch (error) {
            const status = error.status || 500
            const mensagem = error.mensagem || 'Erro no servidor'
            return res.status(status).json({ erro: mensagem })
        }
    }
}

export default new HabilidadesController()
