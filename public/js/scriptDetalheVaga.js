const container = document.getElementById('vagaDetalhe')

const TIPO_LABEL = {
    remoto: 'Remoto',
    presencial: 'Presencial',
    hibrido: 'Hibrido'
}

let vagaAtual = null
let jaCandidatou = false
let statusCandidatura = null
let habilidadesAluno = []

function obterVagaIdDaUrl() {
    const match = window.location.pathname.match(/\/vagas\/(\d+)$/)
    return match ? Number(match[1]) : null
}

function nomeEmpresa(vaga) {
    return (vaga.nome_fantasia || vaga.nome_empresa || 'Empresa').trim()
}

function formatarMeta(vaga) {
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

function criarSecao(titulo, conteudo, isHtml = false) {
    const section = document.createElement('section')
    section.className = 'detalhe-section'

    const label = document.createElement('span')
    label.className = 'detalhe-section-title'
    label.textContent = titulo

    const body = document.createElement('div')
    body.className = 'detalhe-section-body'

    if (isHtml) {
        body.appendChild(conteudo)
    } else {
        body.textContent = conteudo
    }

    section.appendChild(label)
    section.appendChild(body)
    return section
}

function criarSecaoHabilidades(titulo, habilidades, compativeisSet = null) {
    const section = document.createElement('section')
    section.className = 'detalhe-section'

    const label = document.createElement('span')
    label.className = 'detalhe-section-title'
    label.textContent = titulo

    const chips = document.createElement('div')
    chips.className = 'skills-view'

    for (const hab of habilidades) {
        const chip = document.createElement('span')
        const eCompativel = compativeisSet && compativeisSet.has(Number(hab.id))
        chip.className = eCompativel ? 'skill-chip skill-chip-match' : 'skill-chip'
        chip.textContent = hab.nome
        if (eCompativel) chip.title = 'Você possui esta habilidade'
        chips.appendChild(chip)
    }

    section.appendChild(label)
    section.appendChild(chips)
    return section
}

function renderizarAcaoCandidatura(actions) {
    actions.innerHTML = ''

    if (!jaCandidatou) {
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.className = 'btn-primary'
        btn.textContent = 'Candidatar-se'
        btn.addEventListener('click', () => abrirCandidatura())
        actions.appendChild(btn)
        return
    }

    const statusConfig = {
        pendente: { classe: 'badge-pendente', texto: '⏳ Candidatura em análise' },
        aprovado: { classe: 'badge-aprovado', texto: '✅ Candidatura aprovada' },
        rejeitado: { classe: 'badge-rejeitado', texto: '❌ Candidatura rejeitada' }
    }

    const config = statusConfig[statusCandidatura] || statusConfig.pendente

    const badge = document.createElement('span')
    badge.className = `candidatura-badge ${config.classe}`
    badge.textContent = config.texto
    actions.appendChild(badge)
}

async function abrirCandidatura() {
    if (!vagaAtual) return

    const { value: mensagem, isConfirmed } = await Swal.fire({
        title: 'Candidatar-se',
        html: `<p style="margin-bottom:12px;color:#94a3b8">Vaga: <strong>${vagaAtual.titulo}</strong></p>`,
        input: 'textarea',
        inputLabel: 'Mensagem (opcional)',
        inputPlaceholder: 'Conte por que voce tem interesse nesta vaga...',
        showCancelButton: true,
        confirmButtonText: 'Enviar candidatura',
        cancelButtonText: 'Cancelar',
        inputAttributes: { maxlength: '2000' }
    })

    if (!isConfirmed) return

    const resposta = await fetch('/api/candidaturas', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            vagaId: vagaAtual.id,
            mensagem: mensagem?.trim() || null
        })
    })

    const data = await resposta.json().catch(() => ({}))

    if (resposta.status === 409) {
        jaCandidatou = true
        statusCandidatura = statusCandidatura || 'pendente'
        Swal.fire({
            icon: 'info',
            title: 'Ja candidatado',
            text: data.erro || 'Voce ja se candidatou a esta vaga.'
        })
        const actions = container?.querySelector('.detalhe-actions')
        if (actions) renderizarAcaoCandidatura(actions)
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

    jaCandidatou = true
    statusCandidatura = 'pendente'

    await Swal.fire({
        icon: 'success',
        title: 'Candidatura enviada!',
        text: data.mensagem || 'Sua candidatura foi registrada.',
        timer: 1800,
        showConfirmButton: false
    })

    const actions = container?.querySelector('.detalhe-actions')
    if (actions) renderizarAcaoCandidatura(actions)
}

function renderizarVaga(vaga) {
    if (!container) return

    container.innerHTML = ''

    const voltar = document.createElement('a')
    voltar.href = '/home/aluno'
    voltar.className = 'detalhe-back'
    voltar.textContent = '← Voltar'
    voltar.addEventListener('click', (event) => {
        if (window.history.length > 1) {
            event.preventDefault()
            window.history.back()
        }
    })

    const titulo = document.createElement('h1')
    titulo.className = 'detalhe-titulo'
    titulo.textContent = vaga.titulo

    const empresa = document.createElement('p')
    empresa.className = 'detalhe-empresa'
    empresa.textContent = `Empresa: ${nomeEmpresa(vaga)}`

    const meta = document.createElement('p')
    meta.className = 'detalhe-meta'
    meta.textContent = formatarMeta(vaga)

    const prazo = document.createElement('p')
    prazo.className = 'detalhe-prazo'
    const dataFormatada = formatarDataPrazo(vaga.prazo_inscricao)
    const prazoInvalido = dataFormatada === 'Sem prazo definido'
    const localizacao = vaga.localizacao?.trim()

    const linhasPrazo = []
    if (localizacao) linhasPrazo.push(`Localizacao: ${localizacao}`)
    if (!prazoInvalido) linhasPrazo.push(`Prazo: ${dataFormatada}`)
    prazo.textContent = linhasPrazo.join(' • ') || 'Prazo e localizacao nao informados'

    container.appendChild(voltar)

    if (vaga.logo_url) {
        const logo = document.createElement('img')
        logo.src = vaga.logo_url
        logo.alt = nomeEmpresa(vaga)
        logo.className = 'detalhe-empresa-logo'
        container.appendChild(logo)
    }

    container.appendChild(titulo)
    container.appendChild(empresa)
    container.appendChild(meta)
    container.appendChild(prazo)

    if (vaga.descricao?.trim()) {
        container.appendChild(criarSecao('Descricao', vaga.descricao.trim()))
    }

    if (vaga.diferenciais?.trim()) {
        container.appendChild(criarSecao('Diferenciais', vaga.diferenciais.trim()))
    }

    const habilidades = Array.isArray(vaga.habilidades) ? vaga.habilidades : []
    const obrigatorias = habilidades.filter((h) => h.nivel === 'obrigatorio')
    const diferenciais = habilidades.filter((h) => h.nivel === 'diferencial')

    if (obrigatorias.length > 0) {
        const setAluno = habilidadesAluno.length > 0
            ? new Set(habilidadesAluno.map(Number))
            : null

        container.appendChild(criarSecaoHabilidades(
            'Habilidades obrigatorias',
            obrigatorias,
            setAluno
        ))

        if (setAluno) {
            const matches = obrigatorias.filter((h) => setAluno.has(Number(h.id))).length
            const badgeMatch = criarBadgeMatch({ total: obrigatorias.length, compativeis: matches })
            if (badgeMatch) container.appendChild(badgeMatch)
        }
    }

    if (diferenciais.length > 0) {
        const setAluno = habilidadesAluno.length > 0
            ? new Set(habilidadesAluno.map(Number))
            : null

        container.appendChild(criarSecaoHabilidades(
            'Habilidades diferenciais',
            diferenciais,
            setAluno
        ))
    }

    const actions = document.createElement('div')
    actions.className = 'detalhe-actions'
    renderizarAcaoCandidatura(actions)
    container.appendChild(actions)
}

function exibirErro(mensagem) {
    if (!container) return
    container.innerHTML = `
        <a href="/home/aluno" class="detalhe-back">← Voltar</a>
        <p class="detalhe-erro">${mensagem}</p>
    `
}

async function carregarHabilidadesAluno() {
    const resposta = await fetch('/api/perfil/habilidades', { credentials: 'include' })
    if (!resposta.ok) return
    const habilidades = await resposta.json()
    habilidadesAluno = Array.isArray(habilidades) ? habilidades.map((h) => h.id) : []
}

async function verificarCandidatura(vagaId) {
    const resposta = await fetch('/api/candidaturas/minhas', { credentials: 'include' })

    if (resposta.status === 401 || resposta.status === 403) {
        window.location.href = '/login'
        return
    }

    if (!resposta.ok) return

    const candidaturas = await resposta.json()
    if (!Array.isArray(candidaturas)) return

    const candidatura = candidaturas.find((c) => Number(c.vaga_id) === vagaId)
    jaCandidatou = !!candidatura
    statusCandidatura = candidatura?.status || null
}

async function carregarVaga() {
    const vagaId = obterVagaIdDaUrl()

    if (!vagaId || !container) {
        exibirErro('Vaga invalida na URL.')
        return
    }

    const resposta = await fetch(`/api/vagas/${vagaId}`, { credentials: 'include' })

    if (resposta.status === 401 || resposta.status === 403) {
        window.location.href = '/login'
        return
    }

    if (!resposta.ok) {
        const data = await resposta.json().catch(() => ({}))
        exibirErro(data.erro || 'Nao foi possivel carregar os detalhes da vaga.')
        return
    }

    vagaAtual = await resposta.json()
    await verificarCandidatura(vagaId)
    await carregarHabilidadesAluno()
    renderizarVaga(vagaAtual)
}

carregarVaga()
