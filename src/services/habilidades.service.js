import HabilidadesRepository from '../repositories/habilidades.repository.js'

class HabilidadesService {

    async listar() {
        const rows = await HabilidadesRepository.findAll()
        const agrupado = {}

        for (const row of rows) {
            const categoria = row.categoria || 'Outros'
            if (!agrupado[categoria]) {
                agrupado[categoria] = []
            }
            agrupado[categoria].push({ id: row.id, nome: row.nome })
        }

        return agrupado
    }
}

export default new HabilidadesService()
