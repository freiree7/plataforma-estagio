const listaCandidatos = document.getElementById('listaCandidatos')
const tituloVaga = document.getElementById('tituloVaga')
const subtituloVaga = document.getElementById('subtituloVaga')

const STATUS_LABEL = {
    pendente: 'Pendente',
    aprovado: 'Aprovado',
    rejeitado: 'Rejeitado'
}

function obterVagaIdDaUrl() {
    const match = window.location.pathname.match(/\/vagas\/(\d+)\/candidatos/)
    return match ? Number(match[1]) : null
}

function criarChipHabilidade(nome) {
    const chip = document.createElement('span')
    chip.className = 'candidato-chip'
    chip.textContent = nome
    return chip
}

const SOCIAL_ICONS = {
    github: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>`,
    linkedin: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>`
}

function criarLink(label, url) {
    if (!url || !/^https?:\/\//i.test(url.trim())) return null

    const link = document.createElement('a')
    link.href = url.trim()
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.className = 'candidato-social-link'
    link.setAttribute('aria-label', label)
    link.title = label

    const tipo = label.toLowerCase()
    if (SOCIAL_ICONS[tipo]) {
        link.innerHTML = SOCIAL_ICONS[tipo]
    } else {
        link.textContent = label
    }

    return link
}

async function atualizarStatus(candidaturaId, status) {
    const vagaId = obterVagaIdDaUrl()
    const resposta = await fetch(`/api/candidaturas/${candidaturaId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, vagaId })
    })

    const data = await resposta.json().catch(() => ({}))

    if (!resposta.ok) {
        throw new Error(data.erro || 'Nao foi possivel atualizar o status')
    }
}

function criarCardCandidato(candidato, vagaId) {
    const card = document.createElement('article')
    card.className = 'candidato-card'
    card.dataset.candidaturaId = String(candidato.id)

    const header = document.createElement('div')
    header.className = 'candidato-card-header'

    const avatar = document.createElement('div')
    avatar.className = 'candidato-avatar'

    if (candidato.foto_url) {
        const img = document.createElement('img')
        img.src = candidato.foto_url
        img.alt = candidato.nome || 'Foto'
        img.className = 'candidato-avatar-img'
        avatar.appendChild(img)
    } else {
        const parts = (candidato.nome || 'CA').trim().split(/\s+/).filter(Boolean)
        const iniciais = parts.length === 1
            ? parts[0].slice(0, 2).toUpperCase()
            : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        avatar.textContent = iniciais
    }

    const headerInfo = document.createElement('div')
    headerInfo.className = 'candidato-header-info'

    const nome = document.createElement('h3')
    nome.className = 'candidato-nome'
    nome.textContent = candidato.nome || 'Candidato'

    const badge = document.createElement('span')
    badge.className = `status-badge ${candidato.status || 'pendente'}`
    badge.textContent = STATUS_LABEL[candidato.status] || candidato.status

    headerInfo.appendChild(nome)
    headerInfo.appendChild(badge)

    header.appendChild(avatar)
    header.appendChild(headerInfo)

    const meta = document.createElement('p')
    meta.className = 'candidato-meta'
    meta.textContent = [
        candidato.ra ? `RA: ${candidato.ra}` : null,
        candidato.email ? `Email: ${candidato.email}` : null,
        candidato.telefone ? `Tel: ${candidato.telefone}` : null
    ].filter(Boolean).join(' • ') || 'Sem dados de contato'

    card.appendChild(header)
    card.appendChild(meta)

    if (candidato.match && candidato.match.total > 0) {
        const matchEl = document.createElement('p')
        matchEl.className = 'candidato-match'
        const { total, compativeis } = candidato.match
        matchEl.textContent = `${compativeis}/${total} habilidades obrigatórias`

        if (compativeis === total) matchEl.classList.add('match-total')
        else if (compativeis > 0) matchEl.classList.add('match-parcial')
        else matchEl.classList.add('match-zero')

        card.appendChild(matchEl)
    }

    if (candidato.bio?.trim()) {
        const bio = document.createElement('p')
        bio.className = 'candidato-bio'
        bio.textContent = candidato.bio.trim()
        card.appendChild(bio)
    }

    if (Array.isArray(candidato.habilidades) && candidato.habilidades.length > 0) {
        const habWrap = document.createElement('div')
        habWrap.className = 'candidato-habilidades'
        for (const hab of candidato.habilidades) {
            habWrap.appendChild(criarChipHabilidade(hab.nome))
        }
        card.appendChild(habWrap)
    }

    const links = document.createElement('div')
    links.className = 'candidato-links'
    const github = criarLink('GitHub', candidato.github)
    const linkedin = criarLink('LinkedIn', candidato.linkedin)
    if (github) links.appendChild(github)
    if (linkedin) links.appendChild(linkedin)
    if (links.childElementCount > 0) {
        card.appendChild(links)
    }

    const actions = document.createElement('div')
    actions.className = 'candidato-actions'

    const acoes = []

    if (candidato.status !== 'aprovado') {
        acoes.push({ label: 'Aprovar', novoStatus: 'aprovado', classe: 'btn-primary btn-aprovar' })
    }
    if (candidato.status !== 'rejeitado') {
        acoes.push({ label: 'Rejeitar', novoStatus: 'rejeitado', classe: 'btn-secondary btn-rejeitar' })
    }
    if (candidato.status !== 'pendente') {
        acoes.push({ label: 'Marcar pendente', novoStatus: 'pendente', classe: 'btn-secondary' })
    }

    for (const acao of acoes) {
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.className = acao.classe
        btn.textContent = acao.label

        btn.addEventListener('click', async () => {
            if (acao.novoStatus === 'rejeitado') {
                const confirmacao = await Swal.fire({
                    icon: 'warning',
                    title: 'Rejeitar candidato?',
                    text: 'Esta acao pode ser revertida alterando o status depois.',
                    showCancelButton: true,
                    confirmButtonText: 'Rejeitar',
                    cancelButtonText: 'Cancelar'
                })
                if (!confirmacao.isConfirmed) return
            }

            try {
                await atualizarStatus(candidato.id, acao.novoStatus)
                await Swal.fire({
                    icon: 'success',
                    title: `Status atualizado para ${acao.novoStatus}`,
                    timer: 1500,
                    showConfirmButton: false
                })
                await carregarCandidatos()
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Erro', text: error.message })
            }
        })

        actions.appendChild(btn)
    }

    if (actions.childElementCount > 0) {
        card.appendChild(actions)
    }

    return card
}

async function carregarCandidatos() {
    const vagaId = obterVagaIdDaUrl()

    if (!vagaId || !listaCandidatos) {
        if (listaCandidatos) {
            listaCandidatos.innerHTML = '<p class="vagas-empty">Vaga invalida na URL.</p>'
        }
        return
    }

    const resposta = await fetch(`/api/candidaturas/vaga/${vagaId}`, { credentials: 'include' })

    if (resposta.status === 401 || resposta.status === 403) {
        window.location.href = '/login'
        return
    }

    if (!resposta.ok) {
        const data = await resposta.json().catch(() => ({}))
        listaCandidatos.innerHTML = `<p class="vagas-empty">${data.erro || 'Nao foi possivel carregar candidatos.'}</p>`
        return
    }

    const data = await resposta.json()
    const candidatos = data.candidatos || []

    if (tituloVaga && data.vaga?.titulo) {
        tituloVaga.textContent = data.vaga.titulo
    }
    if (subtituloVaga) {
        subtituloVaga.textContent = `${candidatos.length} candidato${candidatos.length === 1 ? '' : 's'} nesta vaga`
    }

    listaCandidatos.innerHTML = ''

    if (candidatos.length === 0) {
        listaCandidatos.innerHTML = '<p class="vagas-empty">Nenhum candidato para esta vaga ainda.</p>'
        return
    }

    const grid = document.createElement('div')
    grid.className = 'candidatos-grid'

    for (const candidato of candidatos) {
        grid.appendChild(criarCardCandidato(candidato, vagaId))
    }

    listaCandidatos.appendChild(grid)
}

carregarCandidatos()
