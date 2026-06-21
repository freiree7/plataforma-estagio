import DashboardService from '../services/dashboard.service.js'

class DashboardController {

    async getMetricas(req, res) {
        try {
            const metricas = await DashboardService.getMetricas(req.usuario.id)
            return res.status(200).json(metricas)
        } catch (error) {
            const status = error.status || 500
            const mensagem = error.mensagem || 'Erro no servidor'
            return res.status(status).json({ erro: mensagem })
        }
    }
}

export default new DashboardController()
