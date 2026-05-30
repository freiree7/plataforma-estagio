import CandidaturasService from '../services/candidaturas.service.js'

class CandidaturasController {

    async candidatar(req, res) {
        try {
            const resultado = await CandidaturasService.candidatar(req.usuario, req.body)
            return res.status(201).json(resultado)
        } catch (error) {
            const status = error.status || 500
            const mensagem = error.mensagem || 'Erro no servidor'
            return res.status(status).json({ erro: mensagem })
        }
    }

    async listarCandidatos(req, res) {
        try {
            const resultado = await CandidaturasService.listarCandidatos(
                req.usuario,
                req.params.vagaId
            )
            return res.status(200).json(resultado)
        } catch (error) {
            const status = error.status || 500
            const mensagem = error.mensagem || 'Erro no servidor'
            return res.status(status).json({ erro: mensagem })
        }
    }

    async listarMinhasCandidaturas(req, res) {
        try {
            const candidaturas = await CandidaturasService.listarMinhasCandidaturas(req.usuario)
            return res.status(200).json(candidaturas)
        } catch (error) {
            const status = error.status || 500
            const mensagem = error.mensagem || 'Erro no servidor'
            return res.status(status).json({ erro: mensagem })
        }
    }

    async atualizarStatus(req, res) {
        try {
            const resultado = await CandidaturasService.atualizarStatus(
                req.usuario,
                req.params.id,
                { status: req.body.status, vagaId: req.body.vagaId }
            )
            return res.status(200).json(resultado)
        } catch (error) {
            const status = error.status || 500
            const mensagem = error.mensagem || 'Erro no servidor'
            return res.status(status).json({ erro: mensagem })
        }
    }
}

export default new CandidaturasController()
