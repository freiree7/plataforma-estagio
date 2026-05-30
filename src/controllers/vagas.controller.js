import VagasService from '../services/vagas.service.js'

class VagasController {

    async criar(req, res) {
        try {
            const resultado = await VagasService.criar(req.usuario, req.body)
            return res.status(201).json(resultado)
        } catch (error) {
            const status = error.status || 500
            const mensagem = error.mensagem || 'Erro no servidor'
            return res.status(status).json({ erro: mensagem })
        }
    }

    async listarAtivas(req, res) {
        try {
            const vagas = await VagasService.listarAtivas(req.usuario)
            return res.status(200).json(vagas)
        } catch (error) {
            const status = error.status || 500
            const mensagem = error.mensagem || 'Erro no servidor'
            return res.status(status).json({ erro: mensagem })
        }
    }

    async listarPorEmpresa(req, res) {
        try {
            const vagas = await VagasService.listarPorEmpresa(req.usuario)
            return res.status(200).json(vagas)
        } catch (error) {
            const status = error.status || 500
            const mensagem = error.mensagem || 'Erro no servidor'
            return res.status(status).json({ erro: mensagem })
        }
    }

    async buscarPorId(req, res) {
        try {
            const vaga = await VagasService.buscarPorId(req.params.id)
            return res.status(200).json(vaga)
        } catch (error) {
            const status = error.status || 500
            const mensagem = error.mensagem || 'Erro no servidor'
            return res.status(status).json({ erro: mensagem })
        }
    }

    async editar(req, res) {
        try {
            const resultado = await VagasService.editar(req.usuario, req.params.id, req.body)
            return res.status(200).json(resultado)
        } catch (error) {
            const status = error.status || 500
            const mensagem = error.mensagem || 'Erro no servidor'
            return res.status(status).json({ erro: mensagem })
        }
    }

    async deletar(req, res) {
        try {
            const resultado = await VagasService.deletar(req.usuario, req.params.id)
            return res.status(200).json(resultado)
        } catch (error) {
            const status = error.status || 500
            const mensagem = error.mensagem || 'Erro no servidor'
            return res.status(status).json({ erro: mensagem })
        }
    }
}

export default new VagasController()
