import UsuariosService from '../services/usuario.services.js'

class UsuariosController {

    async create(req, res) {
        try {
            const { nome, email, senha, tipo, ra, cnpj } = req.body

            await UsuariosService.cadastrar({ nome, email, senha, tipo, ra, cnpj })

            return res.status(201).json({ mensagem: 'Usuário criado com sucesso' })

        } catch (error) {
            const status = error.status || 500
            const mensagem = error.mensagem || 'Erro no servidor'
            return res.status(status).json({ erro: mensagem })
        }
    }

    async login(req, res) {
        try {
            const { identificador, senha } = req.body

            const { token, tipo } = await UsuariosService.login({ identificador, senha })

            res.cookie('token', token, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: 8 * 60 * 60 * 1000
            })

            return res.status(200).json({ tipo })

        } catch (error) {
            const status = error.status || 500
            const mensagem = error.mensagem || 'Erro no servidor'
            return res.status(status).json({ erro: mensagem })
        }
    }


}

export default new UsuariosController()