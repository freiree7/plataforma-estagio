import pool from '../../database/mysql.js'
import VagasRepository from '../repositories/vagas.repository.js'
import HabilidadesRepository from '../repositories/habilidades.repository.js'
import PerfilRepository from '../repositories/perfil.repository.js'

const TIPOS_VALIDOS = new Set(['remoto', 'presencial', 'hibrido'])
const STATUS_VALIDOS = new Set(['ativa', 'encerrada', 'rascunho'])
const NIVEIS_VALIDOS = new Set(['obrigatorio', 'diferencial'])

class VagasService {

    _assertEmpresa(usuario) {
        if (!usuario || usuario.tipo !== 'empresa') {
            throw { status: 403, mensagem: 'Apenas empresas podem realizar esta ação' }
        }
    }

    _normalizarHabilidades(habilidades) {
        if (!Array.isArray(habilidades)) {
            throw { status: 400, mensagem: 'habilidades deve ser um array' }
        }

        const normalizadas = []
        const idsUsados = new Set()

        for (const item of habilidades) {
            const id = Number(item?.id)
            const nivel = item?.nivel

            if (!Number.isInteger(id) || id <= 0) {
                throw { status: 400, mensagem: 'Habilidade inválida' }
            }
            if (!NIVEIS_VALIDOS.has(nivel)) {
                throw { status: 400, mensagem: 'Nível de habilidade inválido' }
            }
            if (idsUsados.has(id)) continue

            idsUsados.add(id)
            normalizadas.push({ id, nivel })
        }

        return normalizadas
    }

    async _validarIdsHabilidades(habilidades) {
        if (habilidades.length === 0) return

        const todas = await HabilidadesRepository.findAll()
        const idsValidos = new Set(todas.map((h) => h.id))
        const invalido = habilidades.find((h) => !idsValidos.has(h.id))

        if (invalido) {
            throw { status: 400, mensagem: 'Uma ou mais habilidades são inválidas' }
        }
    }

    async criar(usuario, dados) {
        this._assertEmpresa(usuario)

        const titulo = (dados.titulo || '').trim()
        const descricao = (dados.descricao || '').trim()
        const diferenciais = typeof dados.diferenciais === 'string' ? dados.diferenciais.trim() : null
        const localizacao = typeof dados.localizacao === 'string' ? dados.localizacao.trim() : null
        const tipo = dados.tipo || null
        const status = dados.status || 'ativa'
        const bolsa = typeof dados.bolsa === 'string' ? dados.bolsa.trim() : null
        const prazo_inscricao = dados.prazo_inscricao || null

        if (!titulo) {
            throw { status: 400, mensagem: 'Título é obrigatório' }
        }
        if (!descricao) {
            throw { status: 400, mensagem: 'Descrição é obrigatória' }
        }
        if (tipo && !TIPOS_VALIDOS.has(tipo)) {
            throw { status: 400, mensagem: 'Tipo de vaga inválido' }
        }
        if (!STATUS_VALIDOS.has(status)) {
            throw { status: 400, mensagem: 'Status inválido' }
        }

        const habilidades = this._normalizarHabilidades(dados.habilidades ?? [])
        await this._validarIdsHabilidades(habilidades)

        const connection = await pool.getConnection()

        try {
            await connection.beginTransaction()

            const vagaId = await VagasRepository.create(
                {
                    titulo,
                    descricao,
                    diferenciais: diferenciais || null,
                    empresa_id: usuario.id,
                    localizacao: localizacao || null,
                    tipo,
                    status,
                    bolsa: bolsa || null,
                    prazo_inscricao: prazo_inscricao || null
                },
                habilidades,
                connection
            )

            await connection.commit()
            return { id: vagaId, mensagem: 'Vaga criada com sucesso' }
        } catch (error) {
            await connection.rollback()
            throw error
        } finally {
            connection.release()
        }
    }

    async listarAtivas(usuario) {
        const vagas = await VagasRepository.findAtivas()

        if (!usuario || usuario.tipo !== 'aluno') return vagas

        const habilidadesAluno = await PerfilRepository.findHabilidadeIdsByUsuario(usuario.id)
        const setAluno = new Set(habilidadesAluno.map(Number))

        return vagas.map((vaga) => {
            const obrigatorias = vaga.habilidades_obrigatorias_ids || []
            const matches = obrigatorias.filter((id) => setAluno.has(Number(id))).length
            return {
                ...vaga,
                match: { total: obrigatorias.length, compativeis: matches }
            }
        })
    }

    async listarPorEmpresa(usuario) {
        this._assertEmpresa(usuario)
        return VagasRepository.findByEmpresa(usuario.id)
    }

    async buscarPorId(id) {
        const vagaId = Number(id)
        if (!Number.isInteger(vagaId) || vagaId <= 0) {
            throw { status: 400, mensagem: 'ID da vaga inválido' }
        }

        const vaga = await VagasRepository.findById(vagaId)
        if (!vaga) {
            throw { status: 404, mensagem: 'Vaga não encontrada' }
        }

        return vaga
    }

    async editar(usuario, vagaIdParam, dados) {
        this._assertEmpresa(usuario)

        const vagaId = Number(vagaIdParam)
        if (!Number.isInteger(vagaId) || vagaId <= 0) {
            throw { status: 400, mensagem: 'ID da vaga inválido' }
        }

        const vaga = await VagasRepository.findResumoById(vagaId)
        if (!vaga) {
            throw { status: 404, mensagem: 'Vaga não encontrada' }
        }
        if (Number(vaga.empresa_id) !== Number(usuario.id)) {
            throw { status: 403, mensagem: 'Você não tem permissão para editar esta vaga' }
        }

        const titulo = (dados.titulo || '').trim()
        const descricao = (dados.descricao || '').trim()
        const diferenciais = typeof dados.diferenciais === 'string' ? dados.diferenciais.trim() : null
        const localizacao = typeof dados.localizacao === 'string' ? dados.localizacao.trim() : null
        const tipo = dados.tipo || null
        const status = dados.status || 'ativa'
        const bolsa = typeof dados.bolsa === 'string' ? dados.bolsa.trim() : null
        const prazo_inscricao = dados.prazo_inscricao || null

        if (!titulo || !descricao) {
            throw { status: 400, mensagem: 'Título e descrição são obrigatórios' }
        }
        if (tipo && !TIPOS_VALIDOS.has(tipo)) {
            throw { status: 400, mensagem: 'Tipo de vaga inválido' }
        }
        if (!STATUS_VALIDOS.has(status)) {
            throw { status: 400, mensagem: 'Status inválido' }
        }

        const habilidades = this._normalizarHabilidades(dados.habilidades ?? [])
        await this._validarIdsHabilidades(habilidades)

        const atualizado = await VagasRepository.update(
            vagaId,
            usuario.id,
            {
                titulo,
                descricao,
                diferenciais: diferenciais || null,
                localizacao: localizacao || null,
                tipo,
                status,
                bolsa: bolsa || null,
                prazo_inscricao: prazo_inscricao || null
            },
            habilidades
        )

        if (!atualizado) {
            throw { status: 404, mensagem: 'Vaga não encontrada' }
        }

        return { mensagem: 'Vaga atualizada com sucesso' }
    }

    async deletar(usuario, id) {
        this._assertEmpresa(usuario)

        const vagaId = Number(id)
        if (!Number.isInteger(vagaId) || vagaId <= 0) {
            throw { status: 400, mensagem: 'ID da vaga inválido' }
        }

        const removida = await VagasRepository.delete(vagaId, usuario.id)
        if (!removida) {
            throw { status: 404, mensagem: 'Vaga não encontrada ou você não tem permissão' }
        }

        return { mensagem: 'Vaga removida com sucesso' }
    }
}

export default new VagasService()
