const listaVagasContainer = document.getElementById('listaVagas')

const TIPO_LABEL = {
    remoto: 'Remoto',
    presencial: 'Presencial',
    hibrido: 'Hibrido'
}

/** @type {Map<number, string>} */
const vagasCandidatadas = new Map()

function nomeEmpresa(vaga) {
    return (vaga.nome_fantasia || vaga.nome_empresa || 'Empresa').trim()
}

function formatarTipoBolsa(vaga) {
    const tipo = vaga.tipo ? (TIPO_LABEL[vaga.tipo] || vaga.tipo) : 'Tipo nao informado'
    const bolsa = vaga.bolsa?.trim() || 'Bolsa a combinar'
    return `${tipo} • ${bolsa}`
}

function criarBadgeMatch(match) {
    if (!match || match.total === 0) return null

    const { total, compativeis } = match
    const badge = document.createElement('span')
    badge.className = 'match-badge'

    if (compativeis === total) {
        badge.classList.add('match-total')
    } else if (compativeis > 0) {
        badge.classList.add('match-parcial')
    } else {
        badge.classList.add('match-zero')
    }

    badge.textContent = `${compativeis}/${total} habilidades compatíveis`
    return badge
}

async function carregarMinhasCandidaturas() {
    const resposta = await fetch('/api/candidaturas/minhas', { credentials: 'include' })

    if (resposta.status === 401 || resposta.status === 403) {
        window.location.href = '/login'
        return
    }

    if (!resposta.ok) return

    const candidaturas = await resposta.json()
    if (!Array.isArray(candidaturas)) return

    for (const c of candidaturas) {
        vagasCandidatadas.set(Number(c.vaga_id), c.status)
    }
}

async function abrirCandidatura(vaga) {
    const { value: mensagem, isConfirmed } = await Swal.fire({
        title: 'Candidatar-se',
        html: `<p style="margin-bottom:12px;color:#94a3b8">Vaga: <strong>${vaga.titulo}</strong></p>`,
        input: 'textarea',
        inputLabel: 'Mensagem (opcional)',
        inputPlaceholder: 'Conte por que voce tem interesse nesta vaga...',
        showCancelButton: true,
        confirmButtonText: 'Enviar candidatura',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#0ea5e9',
        cancelButtonColor: '#334155',
        inputAttributes: { maxlength: '2000' }
    })

    if (!isConfirmed) return

    const resposta = await fetch('/api/candidaturas', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            vagaId: vaga.id,
            mensagem: mensagem?.trim() || null
        })
    })

    const data = await resposta.json().catch(() => ({}))

    if (resposta.status === 409) {
        Swal.fire({
            icon: 'info',
            title: 'Ja candidatado',
            text: data.erro || 'Voce ja se candidatou a esta vaga.'
        })
        vagasCandidatadas.set(Number(vaga.id), 'pendente')
        await carregarVagasAtivas()
        return
    }

    if (!resposta.ok) {
        Swal.fire({
            icon: 'error',
            title: 'Erro ao candidatar',
            text: data.erro || 'Nao foi possivel enviar sua candidatura.'
        })
        return
    }

    vagasCandidatadas.set(Number(vaga.id), 'pendente')

    await Swal.fire({
        icon: 'success',
        title: 'Candidatura enviada!',
        text: data.mensagem || 'Sua candidatura foi registrada.',
        timer: 1800,
        showConfirmButton: false
    })

    await carregarVagasAtivas()
}

function criarBotaoCandidatura(vaga, actions) {
    const status = vagasCandidatadas.get(Number(vaga.id))

    if (status !== undefined) {
        const statusConfig = {
            pendente: { classe: 'badge-pendente', texto: '⏳ Em análise' },
            aprovado: { classe: 'badge-aprovado', texto: '✅ Aprovado' },
            rejeitado: { classe: 'badge-rejeitado', texto: '❌ Rejeitado' }
        }
        const config = statusConfig[status] || statusConfig.pendente
        const badge = document.createElement('span')
        badge.className = `candidatura-badge ${config.classe}`
        badge.textContent = config.texto
        actions.appendChild(badge)
        return
    }

    const btnCandidatar = document.createElement('button')
    btnCandidatar.type = 'button'
    btnCandidatar.className = 'btn-primary'
    btnCandidatar.textContent = 'Candidatar-se'

    btnCandidatar.addEventListener('click', (event) => {
        event.stopPropagation()
        abrirCandidatura(vaga)
    })

    actions.appendChild(btnCandidatar)
}

function criarCardAluno(vaga) {
    const card = document.createElement('article')
    card.className = 'vaga-card'
    card.tabIndex = 0

    const titulo = document.createElement('h3')
    titulo.className = 'vaga-card-titulo'
    titulo.textContent = vaga.titulo

    const empresa = document.createElement('p')
    empresa.className = 'vaga-card-empresa'
    empresa.textContent = `Empresa: ${nomeEmpresa(vaga)}`

    const meta = document.createElement('p')
    meta.className = 'vaga-card-meta'
    meta.textContent = formatarTipoBolsa(vaga)

    const prazo = document.createElement('p')
    prazo.className = 'vaga-card-prazo'
    prazo.textContent = `Prazo: ${formatarDataPrazo(vaga.prazo_inscricao)}`

    const actions = document.createElement('div')
    actions.className = 'vaga-card-actions'

    const btnDetalhes = document.createElement('a')
    btnDetalhes.className = 'btn-secondary'
    btnDetalhes.href = `/vagas/${vaga.id}`
    btnDetalhes.textContent = 'Ver detalhes'
    btnDetalhes.addEventListener('click', (event) => event.stopPropagation())

    actions.appendChild(btnDetalhes)
    criarBotaoCandidatura(vaga, actions)

    card.appendChild(titulo)
    card.appendChild(empresa)
    card.appendChild(meta)
    card.appendChild(prazo)

    if (vaga.match) {
        const badgeMatch = criarBadgeMatch(vaga.match)
        if (badgeMatch) card.appendChild(badgeMatch)
    }

    card.appendChild(actions)

    return card
}

async function carregarVagasAtivas() {
    if (!listaVagasContainer) return

    const resposta = await fetch('/api/vagas', { credentials: 'include' })

    if (!resposta.ok) {
        listaVagasContainer.innerHTML = '<p class="vagas-empty">Nao foi possivel carregar as vagas.</p>'
        return
    }

    const vagas = await resposta.json()
    listaVagasContainer.innerHTML = ''

    if (!Array.isArray(vagas) || vagas.length === 0) {
        listaVagasContainer.innerHTML = '<p class="vagas-empty">Nenhuma vaga ativa no momento.</p>'
        return
    }

    const grid = document.createElement('div')
    grid.className = 'vagas-grid'

    for (const vaga of vagas) {
        grid.appendChild(criarCardAluno(vaga))
    }

    listaVagasContainer.appendChild(grid)
}

async function iniciar() {
    await carregarMinhasCandidaturas()
    await carregarVagasAtivas()
}

iniciar()
