const formEditarVaga = document.getElementById('formEditarVaga')
const containerObrigatorias = document.getElementById('habilidadesObrigatorias')
const containerDiferenciais = document.getElementById('habilidadesDiferenciais')
const btnSalvar = document.getElementById('btnSalvarVaga')

/** @type {Record<string, { id: number, nome: string }[]>} */
let todasHabilidades = {}

/** @type {Set<number>} */
const selecionadasObrigatorias = new Set()

/** @type {Set<number>} */
const selecionadasDiferenciais = new Set()

let vagaId = null

function obterVagaIdDaUrl() {
    const match = window.location.pathname.match(/\/editar-vaga\/(\d+)/)
    return match ? Number(match[1]) : null
}

function formatarDataInput(valor) {
    if (!valor) return ''
    const texto = String(valor)
    if (texto.includes('T')) return texto.split('T')[0]
    return texto.slice(0, 10)
}

function criarChip(hab, nivel, container, selecionadas, outrasSelecionadas) {
    const chip = document.createElement('span')
    chip.className = 'skill-chip selectable'
    chip.setAttribute('role', 'button')
    chip.tabIndex = 0
    chip.textContent = hab.nome
    chip.dataset.id = String(hab.id)

    const aplicarEstado = (ativo) => {
        if (ativo) {
            chip.classList.add('selected')
            chip.setAttribute('aria-pressed', 'true')
        } else {
            chip.classList.remove('selected')
            chip.setAttribute('aria-pressed', 'false')
        }
    }

    aplicarEstado(selecionadas.has(hab.id))

    const toggleChip = () => {
        const id = Number(chip.dataset.id)
        if (selecionadas.has(id)) {
            selecionadas.delete(id)
            aplicarEstado(false)
            return
        }

        outrasSelecionadas.delete(id)
        const outroContainer = nivel === 'obrigatorio' ? containerDiferenciais : containerObrigatorias
        const outroChip = outroContainer?.querySelector(`[data-id="${id}"]`)
        if (outroChip) {
            outroChip.classList.remove('selected')
            outroChip.setAttribute('aria-pressed', 'false')
        }

        selecionadas.add(id)
        aplicarEstado(true)
    }

    chip.addEventListener('click', toggleChip)
    chip.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            toggleChip()
        }
    })

    container.appendChild(chip)
}

function renderChipsHabilidades() {
    if (!containerObrigatorias || !containerDiferenciais) return

    containerObrigatorias.innerHTML = ''
    containerDiferenciais.innerHTML = ''

    const categorias = Object.keys(todasHabilidades).sort((a, b) => a.localeCompare(b, 'pt-BR'))

    if (categorias.length === 0) {
        const empty = document.createElement('span')
        empty.className = 'skills-empty'
        empty.textContent = 'Nenhuma habilidade disponivel'
        containerObrigatorias.appendChild(empty)
        return
    }

    for (const categoria of categorias) {
        for (const hab of todasHabilidades[categoria]) {
            criarChip(hab, 'obrigatorio', containerObrigatorias, selecionadasObrigatorias, selecionadasDiferenciais)
            criarChip(hab, 'diferencial', containerDiferenciais, selecionadasDiferenciais, selecionadasObrigatorias)
        }
    }
}

async function carregarHabilidades() {
    const resposta = await fetch('/api/habilidades', { credentials: 'include' })

    if (resposta.status === 401 || resposta.status === 403) {
        window.location.href = '/login'
        return
    }

    if (!resposta.ok) {
        throw new Error('Nao foi possivel carregar habilidades')
    }

    todasHabilidades = await resposta.json()
    renderChipsHabilidades()
}

function preencherFormulario(vaga) {
    document.getElementById('titulo').value = vaga.titulo || ''
    document.getElementById('descricao').value = vaga.descricao || ''
    document.getElementById('diferenciais').value = vaga.diferenciais || ''
    document.getElementById('tipo').value = vaga.tipo || ''
    document.getElementById('localizacao').value = vaga.localizacao || ''
    document.getElementById('bolsa').value = vaga.bolsa || ''
    document.getElementById('prazo_inscricao').value = formatarDataInput(vaga.prazo_inscricao)
    document.getElementById('status').value = vaga.status || 'ativa'

    selecionadasObrigatorias.clear()
    selecionadasDiferenciais.clear()

    const habilidades = Array.isArray(vaga.habilidades) ? vaga.habilidades : []
    for (const hab of habilidades) {
        if (hab.nivel === 'obrigatorio') {
            selecionadasObrigatorias.add(Number(hab.id))
        }
        if (hab.nivel === 'diferencial') {
            selecionadasDiferenciais.add(Number(hab.id))
        }
    }

    renderChipsHabilidades()
}

async function carregarVaga() {
    vagaId = obterVagaIdDaUrl()

    if (!vagaId) {
        Swal.fire({
            icon: 'error',
            title: 'Vaga invalida',
            text: 'Nao foi possivel identificar a vaga na URL.'
        }).then(() => {
            window.location.href = '/home/empresa'
        })
        return
    }

    const resposta = await fetch(`/api/vagas/${vagaId}`, { credentials: 'include' })

    if (resposta.status === 401 || resposta.status === 403) {
        window.location.href = '/login'
        return
    }

    if (!resposta.ok) {
        const data = await resposta.json().catch(() => ({}))
        Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: data.erro || 'Nao foi possivel carregar a vaga.'
        }).then(() => {
            window.location.href = '/home/empresa'
        })
        return
    }

    const vaga = await resposta.json()
    preencherFormulario(vaga)
}

function montarPayload() {
    const habilidades = []

    for (const id of selecionadasObrigatorias) {
        habilidades.push({ id, nivel: 'obrigatorio' })
    }
    for (const id of selecionadasDiferenciais) {
        habilidades.push({ id, nivel: 'diferencial' })
    }

    const tipo = document.getElementById('tipo')?.value || null

    return {
        titulo: document.getElementById('titulo')?.value.trim(),
        descricao: document.getElementById('descricao')?.value.trim(),
        diferenciais: document.getElementById('diferenciais')?.value.trim() || null,
        tipo: tipo || null,
        localizacao: document.getElementById('localizacao')?.value.trim() || null,
        bolsa: document.getElementById('bolsa')?.value.trim() || null,
        prazo_inscricao: document.getElementById('prazo_inscricao')?.value || null,
        status: document.getElementById('status')?.value || 'ativa',
        habilidades
    }
}

if (formEditarVaga) {
    formEditarVaga.addEventListener('submit', async (event) => {
        event.preventDefault()

        if (!vagaId) return

        const payload = montarPayload()

        if (!payload.titulo || !payload.descricao) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos obrigatorios',
                text: 'Preencha titulo e descricao da vaga.'
            })
            return
        }

        if (btnSalvar) btnSalvar.disabled = true

        try {
            const resposta = await fetch(`/api/vagas/${vagaId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const data = await resposta.json().catch(() => ({}))

            if (!resposta.ok) {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro ao salvar',
                    text: data.erro || 'Nao foi possivel atualizar a vaga.'
                })
                return
            }

            await Swal.fire({
                icon: 'success',
                title: 'Vaga atualizada!',
                text: data.mensagem || 'Alteracoes salvas com sucesso.',
                timer: 1800,
                showConfirmButton: false
            })

            window.location.href = '/home/empresa'
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Falha de conexao ao salvar a vaga.'
            })
        } finally {
            if (btnSalvar) btnSalvar.disabled = false
        }
    })
}

async function iniciar() {
    try {
        await carregarHabilidades()
        await carregarVaga()
    } catch {
        Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Nao foi possivel carregar os dados da pagina.'
        })
    }
}

iniciar()
