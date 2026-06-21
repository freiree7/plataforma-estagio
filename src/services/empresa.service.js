import EmpresaRepository from '../repositories/empresa.repository.js'
import UsuariosRepository from '../repositories/usuarios.repository.js'

class EmpresaService {

    async getPerfil(usuarioId) {
        const perfil = await EmpresaRepository.findPerfilCompleto(usuarioId)
        if (!perfil) throw { status: 404, mensagem: 'Perfil da empresa não encontrado' }
        return perfil
    }

    async updatePerfil(usuarioId, dados) {
        const perfilAtual = await EmpresaRepository.findPerfilCompleto(usuarioId)
        if (!perfilAtual) throw { status: 404, mensagem: 'Perfil não encontrado' }

        const nome = (typeof dados.nome === 'string' ? dados.nome.trim() : '') || perfilAtual.nome
        const email = (typeof dados.email === 'string' ? dados.email.trim().toLowerCase() : '') || perfilAtual.email
        const nome_fantasia = typeof dados.nome_fantasia === 'string' ? dados.nome_fantasia.trim() : null
        const descricao = typeof dados.descricao === 'string' ? dados.descricao.trim() : null

        if (email !== perfilAtual.email) {
            const emailExistente = await UsuariosRepository.findByEmail(email)
            if (emailExistente && emailExistente.id !== usuarioId) {
                throw { status: 400, mensagem: 'Email já cadastrado' }
            }
        }

        await EmpresaRepository.updatePerfil(usuarioId, { nome, email, nome_fantasia, descricao })
    }

    async updateLogo(usuarioId, file) {
        if (!file) throw { status: 400, mensagem: 'Nenhum arquivo enviado' }
        const logoUrl = `/uploads/${file.filename}`
        await EmpresaRepository.updateLogoUrl(usuarioId, logoUrl)
        return { logoUrl }
    }
}

export default new EmpresaService()
