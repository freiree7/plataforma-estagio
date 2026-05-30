const vagasEmpresaContainer = document.getElementById('vagasEmpresa')
const btnNovaVaga = document.getElementById('btnNovaVaga')

const TIPO_LABEL = {
    remoto: 'Remoto',
    presencial: 'Presencial',
    hibrido: 'Hibrido'
}

function formatarTipoBolsa(vaga) {
    const tipo = vaga.tipo ? (TIPO_LABEL[vaga.tipo] || vaga.tipo) : 'Tipo nao informado'
    const bolsa = vaga.bolsa?.trim() || 'Bolsa a combinar'
    return `${tipo} • ${bolsa}`
}

function criarCardEmpresa(vaga) {
    const card = document.createElement('article')
    card.className = 'vaga-card'

    const titulo = document.createElement('h3')
    titulo.className = 'vaga-card-titulo'
    titulo.textContent = vaga.titulo

    const meta = document.createElement('p')
    meta.className = 'vaga-card-meta'
    meta.textContent = formatarTipoBolsa(vaga)

    const prazo = document.createElement('p')
    prazo.className = 'vaga-card-prazo'
    prazo.textContent = `Prazo: ${formatarDataPrazo(vaga.prazo_inscricao)}`

    const candidatos = document.createElement('p')
    candidatos.className = 'vaga-card-candidatos'
    const total = Number(vaga.total_candidatos) || 0
    candidatos.textContent = `${total} candidato${total === 1 ? '' : 's'}`

    const actions = document.createElement('div')
    actions.className = 'vaga-card-actions'

    const btnEditar = document.createElement('a')
    btnEditar.className = 'btn-secondary'
    btnEditar.href = `/editar-vaga/${vaga.id}`
    btnEditar.textContent = 'Editar vaga'

    const btnCandidatos = document.createElement('a')
    btnCandidatos.className = 'btn-secondary'
    btnCandidatos.href = `/vagas/${vaga.id}/candidatos`
    btnCandidatos.textContent = 'Ver candidatos'

    actions.appendChild(btnEditar)
    actions.appendChild(btnCandidatos)

    card.appendChild(titulo)
    card.appendChild(meta)
    card.appendChild(prazo)
    card.appendChild(candidatos)
    card.appendChild(actions)

    return card
}

async function carregarVagasEmpresa() {
    if (!vagasEmpresaContainer) return

    const resposta = await fetch('/api/vagas/empresa/minhas', { credentials: 'include' })

    if (resposta.status === 401 || resposta.status === 403) {
        window.location.href = '/login'
        return
    }

    if (!resposta.ok) {
        vagasEmpresaContainer.innerHTML = '<p class="vagas-empty">Nao foi possivel carregar suas vagas.</p>'
        return
    }

    const vagas = await resposta.json()
    vagasEmpresaContainer.innerHTML = ''

    if (!Array.isArray(vagas) || vagas.length === 0) {
        vagasEmpresaContainer.innerHTML = '<p class="vagas-empty">Nenhuma vaga publicada ainda. Clique em Nova Vaga para comecar.</p>'
        return
    }

    const grid = document.createElement('div')
    grid.className = 'vagas-grid'

    for (const vaga of vagas) {
        grid.appendChild(criarCardEmpresa(vaga))
    }

    vagasEmpresaContainer.appendChild(grid)
}

if (btnNovaVaga) {
    btnNovaVaga.addEventListener('click', () => {
        window.location.href = '/criar-vaga'
    })
}

carregarVagasEmpresa()
