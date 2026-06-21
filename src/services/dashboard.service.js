import DashboardRepository from '../repositories/dashboard.repository.js'

class DashboardService {

    async getMetricas(usuarioId) {
        return DashboardRepository.getMetricasEmpresa(usuarioId)
    }
}

export default new DashboardService()
