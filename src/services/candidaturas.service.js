import CandidaturasRepository from '../repositories/candidaturas.repository.js'
import VagasRepository from '../repositories/vagas.repository.js'
import PerfilRepository from '../repositories/perfil.repository.js'

const STATUS_CANDIDATURA = new Set(['pendente', 'aprovado', 'rejeitado'])

class CandidaturasService {

    _assertAluno(usuario) {
        if (!usuario || usuario.tipo !== 'aluno') {
            throw { status: 403, mensagem: 'Apenas alunos podem realizar esta ação' }
        }
    }

    _assertEmpresa(usuario) {
        if (!usuario || usuario.tipo !== 'empresa') {
            throw { status: 403, mensagem: 'Apenas empresas podem realizar esta ação' }
        }
    }

    async _assertVagaDaEmpresa(vagaId, empresaId) {
        const vaga = await VagasRepository.findResumoById(vagaId)
        if (!vaga) {
            throw { status: 404, mensagem: 'Vaga não encontrada' }
        }
        if (vaga.empresa_id !== empresaId) {
            throw { status: 403, mensagem: 'Você não tem permissão para esta vaga' }
        }
        return vaga
    }

    async candidatar(usuario, { vagaId, mensagem }) {
        this._assertAluno(usuario)

        const idVaga = Number(vagaId)
        if (!Number.isInteger(idVaga) || idVaga <= 0) {
            throw { status: 400, mensagem: 'ID da vaga inválido' }
        }

        const vaga = await VagasRepository.findResumoById(idVaga)
        if (!vaga) {
            throw { status: 404, mensagem: 'Vaga não encontrada' }
        }
        if (vaga.status !== 'ativa') {
            throw { status: 400, mensagem: 'Esta vaga não está aceitando candidaturas' }
        }

        const existente = await CandidaturasRepository.findByAlunoEVaga(usuario.id, idVaga)
        if (existente) {
            throw { status: 409, mensagem: 'Você já se candidatou a esta vaga' }
        }

        const textoMensagem = typeof mensagem === 'string' ? mensagem.trim() : null

        const candidaturaId = await CandidaturasRepository.create(
            usuario.id,
            idVaga,
            textoMensagem || null
        )

        return {
            id: candidaturaId,
            mensagem: 'Candidatura enviada com sucesso'
        }
    }

    async listarCandidatos(usuario, vagaIdParam) {
        this._assertEmpresa(usuario)

        const vagaId = Number(vagaIdParam)
        if (!Number.isInteger(vagaId) || vagaId <= 0) {
            throw { status: 400, mensagem: 'ID da vaga inválido' }
        }

        const vagaResumo = await this._assertVagaDaEmpresa(vagaId, usuario.id)
        const candidatos = await CandidaturasRepository.findByVaga(vagaId)
        const vagaCompleta = await VagasRepository.findById(vagaId)

        const obrigatorias = (vagaCompleta?.habilidades || [])
            .filter((h) => h.nivel === 'obrigatorio')
            .map((h) => h.id)
        const setObrigatorias = new Set(obrigatorias.map(Number))

        const candidatosComHabilidades = await Promise.all(
            candidatos.map(async (c) => {
                const habilidades = await PerfilRepository.findHabilidadesByUsuario(c.usuario_id)
                const habilidadesCandidato = c.habilidades_candidato_ids || []
                const matches = habilidadesCandidato.filter((id) => setObrigatorias.has(Number(id))).length
                return {
                    ...c,
                    habilidades,
                    match: { total: obrigatorias.length, compativeis: matches }
                }
            })
        )

        return {
            vaga: { id: vagaResumo.id, titulo: vagaResumo.titulo },
            candidatos: candidatosComHabilidades
        }
    }

    async listarMinhasCandidaturas(usuario) {
        this._assertAluno(usuario)
        return CandidaturasRepository.findByAluno(usuario.id)
    }

    async atualizarStatus(usuario, candidaturaIdParam, { status, vagaId }) {
        this._assertEmpresa(usuario)

        const candidaturaId = Number(candidaturaIdParam)
        if (!Number.isInteger(candidaturaId) || candidaturaId <= 0) {
            throw { status: 400, mensagem: 'ID da candidatura inválido' }
        }
        if (!STATUS_CANDIDATURA.has(status)) {
            throw { status: 400, mensagem: 'Status inválido' }
        }

        const candidatura = await CandidaturasRepository.findById(candidaturaId)
        if (!candidatura) {
            throw { status: 404, mensagem: 'Candidatura não encontrada' }
        }

        const idVaga = Number(vagaId ?? candidatura.vaga_id)
        await this._assertVagaDaEmpresa(idVaga, usuario.id)

        if (candidatura.vaga_id !== idVaga) {
            throw { status: 400, mensagem: 'Candidatura não pertence a esta vaga' }
        }

        const atualizado = await CandidaturasRepository.updateStatus(
            candidaturaId,
            idVaga,
            usuario.id,
            status
        )

        if (!atualizado) {
            throw { status: 404, mensagem: 'Não foi possível atualizar a candidatura' }
        }

        return { mensagem: 'Status atualizado com sucesso', status }
    }
}

export default new CandidaturasService()
