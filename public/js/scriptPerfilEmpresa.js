const fieldCards = document.querySelectorAll('.field-card')
const perfilAvatarEl = document.getElementById('perfilAvatar')
const logoInput = document.getElementById('logoInput')
const perfilAvatarIniciais = document.getElementById('perfilAvatarIniciais')
const cnpjView = document.getElementById('perfilCnpj')
const nomeFantasiaView = document.getElementById('perfilNomeFantasia')
const nomeFantasiaInput = document.getElementById('perfilNomeFantasiaInput')
const nomeView = document.getElementById('perfilNome')
const nomeInput = document.getElementById('perfilNomeInput')
const emailView = document.getElementById('perfilEmail')
const emailInput = document.getElementById('perfilEmailInput')
const descricaoView = document.getElementById('perfilDescricao')
const descricaoInput = document.getElementById('perfilDescricaoInput')
const editButton = document.getElementById('editarPerfilBtn')
const saveButton = document.getElementById('salvarPerfilBtn')
const cancelButton = document.getElementById('cancelarEdicaoBtn')
const editFeedback = document.getElementById('editFeedback')
const perfilCard = document.querySelector('.perfil-card')

/** @type {Record<string, unknown> | null} */
let perfilCarregado = null

function initialsFromNome(nome) {
    const parts = (nome || '').trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return 'EM'
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    const first = parts[0][0] || ''
    const last = parts[parts.length - 1][0] || ''
    return (first + last).toUpperCase() || 'EM'
}

function displayText(value, fallback = '—') {
    const trimmed = (value || '').trim()
    return trimmed || fallback
}

function syncAvatarInitials() {
    if (!perfilAvatarIniciais) return
    const nomeExibicao = (nomeFantasiaView?.textContent || nomeView?.textContent || '').trim()
    if (nomeExibicao && nomeExibicao !== '—') {
        perfilAvatarIniciais.textContent = initialsFromNome(nomeExibicao)
    }
}

function aplicarLogo(logoUrl) {
    if (!perfilAvatarEl) return

    const imgExistente = perfilAvatarEl.querySelector('img')
    if (imgExistente) imgExistente.remove()

    if (!logoUrl) {
        if (perfilAvatarIniciais) perfilAvatarIniciais.style.display = ''
        return
    }

    const img = document.createElement('img')
    img.src = logoUrl
    img.alt = 'Logo da empresa'

    if (perfilAvatarIniciais) perfilAvatarIniciais.style.display = 'none'

    const overlay = perfilAvatarEl.querySelector('.perfil-avatar-overlay')
    perfilAvatarEl.insertBefore(img, overlay)
}

function aplicarPerfilNaTela(perfil) {
    if (!nomeView || !emailView || !cnpjView) return

    cnpjView.textContent = displayText(perfil.cnpj)
    nomeFantasiaView.textContent = displayText(perfil.nome_fantasia)
    nomeView.textContent = displayText(perfil.nome, 'Razao social')
    emailView.textContent = displayText(perfil.email, 'email@empresa.com')

    if (descricaoView) {
        descricaoView.textContent = (perfil.descricao || '').trim()
    }

    syncAvatarInitials()

    if (perfil.logo_url) {
        aplicarLogo(perfil.logo_url)
    }
}

async function carregarPerfil() {
    const resposta = await fetch('/api/usuarios/empresa/perfil', { credentials: 'include' })

    if (resposta.status === 401 || resposta.status === 403) {
        window.location.href = '/login'
        return
    }

    if (!resposta.ok) {
        throw new Error('Nao foi possivel carregar o perfil da empresa')
    }

    perfilCarregado = await resposta.json()
    aplicarPerfilNaTela(perfilCarregado)
}

async function salvarPerfil() {
    const resposta = await fetch('/api/usuarios/empresa/perfil', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nome: nomeInput.value.trim(),
            email: emailInput.value.trim(),
            nome_fantasia: nomeFantasiaInput.value.trim(),
            descricao: descricaoInput ? descricaoInput.value.trim() : ''
        })
    })

    if (!resposta.ok) {
        const data = await resposta.json().catch(() => ({}))
        throw new Error(data.erro || 'Erro ao salvar perfil')
    }
}

if (fieldCards.length > 0) {
    fieldCards.forEach((card, index) => {
        window.setTimeout(() => {
            card.classList.add('animate-in')
        }, 90 * index)
    })
}

carregarPerfil().catch((error) => {
    if (editFeedback) editFeedback.textContent = error.message
})

if (perfilAvatarEl && logoInput) {
    perfilAvatarEl.addEventListener('click', () => {
        logoInput.click()
    })

    logoInput.addEventListener('change', async () => {
        const file = logoInput.files[0]
        if (!file) return

        const maxSize = 3 * 1024 * 1024
        if (file.size > maxSize) {
            if (typeof Swal !== 'undefined') {
                Swal.fire({ icon: 'error', title: 'Arquivo muito grande', text: 'Maximo 3MB.' })
            } else if (editFeedback) {
                editFeedback.textContent = 'Arquivo muito grande. Maximo 3MB.'
            }
            return
        }

        perfilAvatarEl.classList.add('uploading')

        try {
            const formData = new FormData()
            formData.append('foto', file)

            const resposta = await fetch('/api/usuarios/empresa/perfil/logo', {
                method: 'POST',
                credentials: 'include',
                body: formData
            })

            const data = await resposta.json().catch(() => ({}))

            if (!resposta.ok) {
                throw new Error(data.erro || 'Erro ao fazer upload')
            }

            aplicarLogo(data.logoUrl)

            if (editFeedback) {
                editFeedback.textContent = 'Logo atualizada com sucesso.'
            }
        } catch (error) {
            if (typeof Swal !== 'undefined') {
                Swal.fire({ icon: 'error', title: 'Erro no upload', text: error.message })
            } else if (editFeedback) {
                editFeedback.textContent = error.message
            }
        } finally {
            perfilAvatarEl.classList.remove('uploading')
            logoInput.value = ''
        }
    })
}

if (
    editButton &&
    saveButton &&
    cancelButton &&
    editFeedback &&
    perfilCard &&
    nomeFantasiaView &&
    nomeView &&
    emailView &&
    nomeFantasiaInput &&
    nomeInput &&
    emailInput
) {
    const syncInputsFromView = () => {
        nomeFantasiaInput.value = nomeFantasiaView.textContent.trim() === '—' ? '' : nomeFantasiaView.textContent.trim()
        nomeInput.value = nomeView.textContent.trim() === '—' ? '' : nomeView.textContent.trim()
        emailInput.value = emailView.textContent.trim() === '—' ? '' : emailView.textContent.trim()

        if (descricaoInput && descricaoView) {
            descricaoInput.value = descricaoView.textContent.trim()
        }
    }

    const enterEditMode = () => {
        syncInputsFromView()
        perfilCard.classList.add('editing')
        editFeedback.textContent = 'Modo de edicao ativado.'
        nomeFantasiaInput.focus()
    }

    const exitEditMode = () => {
        perfilCard.classList.remove('editing')
    }

    editButton.addEventListener('click', () => {
        editButton.classList.add('is-active')
        enterEditMode()
        window.setTimeout(() => {
            editButton.classList.remove('is-active')
        }, 180)
    })

    cancelButton.addEventListener('click', () => {
        if (perfilCarregado) aplicarPerfilNaTela(perfilCarregado)
        exitEditMode()
        editFeedback.textContent = 'Edicao cancelada.'
    })

    saveButton.addEventListener('click', async () => {
        saveButton.disabled = true
        try {
            await salvarPerfil()
            exitEditMode()
            editFeedback.textContent = 'Perfil salvo com sucesso.'
            setTimeout(() => {
                window.location.reload()
            }, 800)
        } catch (error) {
            editFeedback.textContent = error.message
        } finally {
            saveButton.disabled = false
        }
    })
}
