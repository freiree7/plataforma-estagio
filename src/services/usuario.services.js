import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import UsuariosRepository from '../repositories/usuarios.repository.js'

class UsuariosService {

    async cadastrar({ nome, email, senha, tipo, ra, cnpj }) {

        // validações basicas (se o campo foi preenchido)
        const tiposValidos = ['aluno', 'empresa']
        if (!nome || !email || !senha || !tipo || !tiposValidos.includes(tipo)) {
            throw { status: 400, mensagem: 'Campos obrigatórios não preenchidos' }
        }

        // limpa os dados com os caracteres especiais
        const raLimpo = typeof ra === 'string' ? ra.trim().replace(/\D/g, '') : ''
        const cnpjLimpo = typeof cnpj === 'string' ? cnpj.replace(/\D/g, '') : ''

        // valida o formato do RA e CNPJ
        if (tipo === 'aluno' && !raLimpo) {
            throw { status: 400, mensagem: 'RA é obrigatório para aluno' }
        }

        if (tipo === 'aluno' && raLimpo.length !== 10) {
            throw { status: 400, mensagem: 'RA inválido — deve conter 10 dígitos' }
        }

        if (tipo === 'empresa' && !cnpjLimpo) {
            throw { status: 400, mensagem: 'CNPJ é obrigatório para empresa' }
        }

        if (tipo === 'empresa' && cnpjLimpo.length !== 14) {
            throw { status: 400, mensagem: 'CNPJ inválido — deve conter 14 dígitos' }
        }

        // verificações se esta duplicado (email, RA, CNPJ)
        const emailExistente = await UsuariosRepository.findByEmail(email)
        if (emailExistente) {
            throw { status: 400, mensagem: 'Email já cadastrado' }
        }

        if (tipo === 'aluno') {
            const raExistente = await UsuariosRepository.findByRA(raLimpo)
            if (raExistente) {
                throw { status: 400, mensagem: 'RA já cadastrado' }
            }
        }

        if (tipo === 'empresa') {
            const cnpjExistente = await UsuariosRepository.findByCNPJ(cnpjLimpo)
            if (cnpjExistente) {
                throw { status: 400, mensagem: 'CNPJ já cadastrado' }
            }
        }

        // criptografia e criação
        const senhaCrypt = await bcrypt.hash(senha.trim(), 10)

        await UsuariosRepository.create({
            nome,
            email,
            senha: senhaCrypt,
            tipo,
            ra: tipo === 'aluno' ? raLimpo : null,
            cnpj: tipo === 'empresa' ? cnpjLimpo : null
        })
    }

    async login({ identificador, senha }) {

        // validações basicas (se o campo foi preenchido)
        if (!identificador || !senha) {
            throw { status: 400, mensagem: 'Campos obrigatórios não preenchidos' }
        }

        // busca o usuário pelo identificador
        const candidatos = await UsuariosRepository.findByIdentifier(identificador)

        if (!candidatos || candidatos.length === 0) {
            throw { status: 401, mensagem: 'Usuário não encontrado' }
        }

        // verifica a senha
        let usuarioLogin = null
        for (const candidato of candidatos) {
            const senhaValida = await bcrypt.compare(senha.trim(), candidato.senha)
            if (senhaValida) {
                usuarioLogin = candidato
                break
            }
        }

        if (!usuarioLogin) {
            throw { status: 401, mensagem: 'Email/CNPJ/RA ou Senha inválida' }
        }

        // gera o token JWT
        const token = jwt.sign(
            { id: usuarioLogin.id, tipo: usuarioLogin.tipo },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        )
        

        return { token, tipo: usuarioLogin.tipo }
    }
}

export default new UsuariosService()