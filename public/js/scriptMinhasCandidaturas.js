const listaCandidaturas = document.getElementById('listaCandidaturas')

const TIPO_LABEL = {
    remoto: 'Remoto',
    presencial: 'Presencial',
    hibrido: 'Hibrido'
}

const STATUS_CONFIG = {
    pendente: { classe: 'badge-pendente', texto: '⏳ Em análise' },
    aprovado: { classe: 'badge-aprovado', texto: '✅ Aprovado' },
    rejeitado: { classe: 'badge-rejeitado', texto: '❌ Rejeitado' }
}

function formatarDataCandidatura(data) {
    if (!data) return 'Data nao informada'
    const date = new Date(data)
    if (Number.isNaN(date.getTime())) return 'Data nao informada'
    return date.toLocaleDateString('pt-BR')
}

function formatarMeta(candidatura) {
    const tipo = candidatura.tipo ? (TIPO_LABEL[candidatura.tipo] || candidatura.tipo) : 'Tipo nao informado'
    const bolsa = candidatura.bolsa?.trim() || 'Bolsa a combinar'
    return `${tipo} • ${bolsa}`
}

function criarBadgeStatus(status) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pendente
    const badge = document.createElement('span')
    badge.className = `candidatura-badge ${config.classe}`
    badge.textContent = config.texto
    return badge
}

function criarCardCandidatura(candidatura) {
    const card = document.createElement('article')
    card.className = 'candidatura-item'

    const tituloWrap = document.createElement('h2')
    tituloWrap.className = 'candidatura-item-titulo'

    const link = document.createElement('a')
    link.href = `/vagas/${candidatura.vaga_id}`
    link.textContent = candidatura.titulo || 'Vaga sem titulo'
    tituloWrap.appendChild(link)

    const empresa = document.createElement('p')
    empresa.className = 'candidatura-item-empresa'
    empresa.textContent = `Empresa: ${(candidatura.nome_empresa || 'Empresa').trim()}`

    const meta = document.createElement('p')
    meta.className = 'candidatura-item-meta'
    meta.textContent = formatarMeta(candidatura)

    const data = document.createElement('p')
    data.className = 'candidatura-item-data'
    data.textContent = `Candidatura em: ${formatarDataCandidatura(candidatura.criado_em)}`

    const statusWrap = document.createElement('div')
    statusWrap.className = 'candidatura-item-status'
    statusWrap.appendChild(criarBadgeStatus(candidatura.status))

    card.appendChild(tituloWrap)
    card.appendChild(empresa)
    card.appendChild(meta)
    card.appendChild(data)
    card.appendChild(statusWrap)

    return card
}

async function carregarCandidaturas() {
    if (!listaCandidaturas) return

    const resposta = await fetch('/api/candidaturas/minhas', { credentials: 'include' })

    if (resposta.status === 401 || resposta.status === 403) {
        window.location.href = '/login'
        return
    }

    if (!resposta.ok) {
        listaCandidaturas.innerHTML = '<p class="candidaturas-empty">Nao foi possivel carregar suas candidaturas.</p>'
        return
    }

    const candidaturas = await resposta.json()
    listaCandidaturas.innerHTML = ''

    if (!Array.isArray(candidaturas) || candidaturas.length === 0) {
        listaCandidaturas.innerHTML =
            '<p class="candidaturas-empty">Voce ainda nao se candidatou a nenhuma vaga. <a href="/home/aluno" style="color:var(--accent)">Explorar vagas</a></p>'
        return
    }

    for (const candidatura of candidaturas) {
        listaCandidaturas.appendChild(criarCardCandidatura(candidatura))
    }
}

carregarCandidaturas()
