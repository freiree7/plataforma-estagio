const formCriarVaga = document.getElementById('formCriarVaga')
const containerObrigatorias = document.getElementById('habilidadesObrigatorias')
const containerDiferenciais = document.getElementById('habilidadesDiferenciais')
const btnPublicar = document.getElementById('btnPublicarVaga')

/** @type {Record<string, { id: number, nome: string }[]>} */
let todasHabilidades = {}

/** @type {Set<number>} */
const selecionadasObrigatorias = new Set()

/** @type {Set<number>} */
const selecionadasDiferenciais = new Set()

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
        status: 'ativa',
        habilidades
    }
}

if (formCriarVaga) {
    formCriarVaga.addEventListener('submit', async (event) => {
        event.preventDefault()

        const payload = montarPayload()

        if (!payload.titulo || !payload.descricao) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos obrigatorios',
                text: 'Preencha titulo e descricao da vaga.'
            })
            return
        }

        if (btnPublicar) btnPublicar.disabled = true

        try {
            const resposta = await fetch('/api/vagas', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const data = await resposta.json().catch(() => ({}))

            if (!resposta.ok) {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro ao publicar',
                    text: data.erro || 'Nao foi possivel criar a vaga.'
                })
                return
            }

            await Swal.fire({
                icon: 'success',
                title: 'Vaga publicada!',
                text: data.mensagem || 'Sua vaga foi criada com sucesso.',
                timer: 1800,
                showConfirmButton: false
            })

            window.location.href = '/home/empresa'
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Falha de conexao ao publicar a vaga.'
            })
        } finally {
            if (btnPublicar) btnPublicar.disabled = false
        }
    })
}

carregarHabilidades().catch(() => {
    Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Nao foi possivel carregar as habilidades.'
    })
})
