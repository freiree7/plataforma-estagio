const fieldCards = document.querySelectorAll(".field-card");
const editButton = document.getElementById("editarPerfilBtn");
const saveButton = document.getElementById("salvarPerfilBtn");
const cancelButton = document.getElementById("cancelarEdicaoBtn");
const editFeedback = document.getElementById("editFeedback");
const perfilCard = document.querySelector(".perfil-card");
const nomeView = document.getElementById("perfilNome");
const emailView = document.getElementById("perfilEmail");
const raView = document.getElementById("perfilRa");
const nomeInput = document.getElementById("perfilNomeInput");
const emailInput = document.getElementById("perfilEmailInput");
const raInput = document.getElementById("perfilRaInput");
const bioView = document.getElementById("perfilBio");
const bioInput = document.getElementById("perfilBioInput");
const telefoneView = document.getElementById("perfilTelefone");
const telefoneInput = document.getElementById("perfilTelefoneInput");
const habilidadesView = document.getElementById("perfilHabilidadesView");
const habilidadesEdit = document.getElementById("perfilHabilidadesEdit");
const githubView = document.getElementById("perfilGithubView");
const githubInput = document.getElementById("perfilGithubInput");
const linkedinView = document.getElementById("perfilLinkedinView");
const linkedinInput = document.getElementById("perfilLinkedinInput");
const avatarIniciais = document.getElementById("perfilAvatarIniciais");
const perfilAvatarEl = document.getElementById("perfilAvatar");
const fotoInput = document.getElementById("fotoInput");

/** @type {{ id: number, nome: string, categoria?: string }[]} */
let habilidadesUsuario = [];
/** @type {Set<number>} */
let habilidadesSelecionadas = new Set();
/** @type {Record<string, { id: number, nome: string }[]>} */
let todasHabilidades = {};
/** @type {Record<string, unknown> | null} */
let perfilCarregado = null;

function initialsFromNome(nome) {
    const parts = nome.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "PF";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    const first = parts[0][0] || "";
    const last = parts[parts.length - 1][0] || "";
    return (first + last).toUpperCase() || "PF";
}

function syncAvatarInitials() {
    if (!avatarIniciais || !nomeView) return;
    avatarIniciais.textContent = initialsFromNome(nomeView.textContent);
}

function aplicarFoto(fotoUrl) {
    if (!perfilAvatarEl) return;

    const imgExistente = perfilAvatarEl.querySelector("img");
    if (imgExistente) imgExistente.remove();

    if (!fotoUrl) {
        if (avatarIniciais) avatarIniciais.style.display = "";
        return;
    }

    const img = document.createElement("img");
    img.src = fotoUrl;
    img.alt = "Foto de perfil";

    if (avatarIniciais) avatarIniciais.style.display = "none";

    const overlay = perfilAvatarEl.querySelector(".perfil-avatar-overlay");
    perfilAvatarEl.insertBefore(img, overlay);
}

function displayText(value, fallback = "—") {
    const trimmed = (value || "").trim();
    return trimmed || fallback;
}

/** @param {HTMLAnchorElement} anchor */
function syncSocialUrlFromAnchor(anchor, inputEl) {
    if (!anchor || !inputEl) return;
    if (anchor.classList.contains("is-placeholder")) {
        inputEl.value = "";
        return;
    }
    inputEl.value = anchor.getAttribute("href") === "#" ? "" : anchor.getAttribute("href") || "";
}

/** @param {HTMLAnchorElement} anchor @param {string} raw */
function applySocialDisplay(anchor, raw) {
    if (!anchor) return;
    const trimmed = raw.trim();
    const isHttp = /^https?:\/\//i.test(trimmed);
    if (!isHttp) {
        anchor.href = "#";
        anchor.textContent = anchor.dataset.placeholder || "Informe o link";
        anchor.classList.add("is-placeholder");
        return;
    }
    anchor.href = trimmed;
    anchor.textContent = trimmed;
    anchor.classList.remove("is-placeholder");
}

/** @param {Record<string, unknown>} perfil */
function aplicarPerfilNaTela(perfil) {
    if (!nomeView || !emailView || !raView) return;

    nomeView.textContent = displayText(perfil.nome, "Nome do usuario");
    emailView.textContent = displayText(perfil.email, "usuario@email.com");
    raView.textContent = displayText(perfil.ra, "—");

    // bio — se vazio deixa o elemento vazio (o :empty no CSS esconde)
    if (bioView) {
        const bioTexto = (perfil.bio || "").trim();
        bioView.textContent = bioTexto;
    }

    if (telefoneView) {
        telefoneView.textContent = displayText(perfil.telefone);
    }

    applySocialDisplay(githubView, perfil.github || "");
    applySocialDisplay(linkedinView, perfil.linkedin || "");
    syncAvatarInitials();

    if (perfil.foto_url) {
        aplicarFoto(perfil.foto_url);
    }
}

function renderHabilidadesView() {
    if (!habilidadesView) return;
    habilidadesView.innerHTML = "";
    if (habilidadesUsuario.length === 0) {
        const empty = document.createElement("span");
        empty.className = "skills-empty";
        empty.textContent = "Nenhuma habilidade selecionada";
        habilidadesView.appendChild(empty);
        return;
    }
    for (const hab of habilidadesUsuario) {
        const chip = document.createElement("span");
        chip.className = "skill-chip";
        chip.textContent = hab.nome;
        habilidadesView.appendChild(chip);
    }
}

function renderHabilidadesEdit() {
    if (!habilidadesEdit) return;
    habilidadesEdit.innerHTML = "";
    const categorias = Object.keys(todasHabilidades).sort((a, b) => a.localeCompare(b, "pt-BR"));
    if (categorias.length === 0) {
        const empty = document.createElement("span");
        empty.className = "skills-empty";
        empty.textContent = "Nenhuma habilidade disponivel";
        habilidadesEdit.appendChild(empty);
        return;
    }
    for (const categoria of categorias) {
        const group = document.createElement("div");
        group.className = "skills-edit-group";

        const label = document.createElement("span");
        label.className = "skills-edit-category";
        label.textContent = categoria;
        group.appendChild(label);

        const chipsWrap = document.createElement("div");
        chipsWrap.className = "skills-edit-chips";

        for (const hab of todasHabilidades[categoria]) {
            const chip = document.createElement("span");
            chip.className = "skill-chip selectable";
            chip.setAttribute("role", "button");
            chip.tabIndex = 0;
            chip.textContent = hab.nome;
            chip.dataset.id = String(hab.id);

            if (habilidadesSelecionadas.has(hab.id)) {
                chip.classList.add("selected");
                chip.setAttribute("aria-pressed", "true");
            } else {
                chip.setAttribute("aria-pressed", "false");
            }

            const toggleChip = () => {
                const id = Number(chip.dataset.id);
                if (habilidadesSelecionadas.has(id)) {
                    habilidadesSelecionadas.delete(id);
                    chip.classList.remove("selected");
                    chip.setAttribute("aria-pressed", "false");
                } else {
                    habilidadesSelecionadas.add(id);
                    chip.classList.add("selected");
                    chip.setAttribute("aria-pressed", "true");
                }
            };

            chip.addEventListener("click", toggleChip);
            chip.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    toggleChip();
                }
            });

            chipsWrap.appendChild(chip);
        }

        group.appendChild(chipsWrap);
        habilidadesEdit.appendChild(group);
    }
}

function syncSelecaoFromUsuario() {
    habilidadesSelecionadas = new Set(habilidadesUsuario.map((h) => h.id));
}

async function carregarPerfil() {
    const resposta = await fetch("/api/usuarios/perfil", { credentials: "include" });
    if (resposta.status === 401 || resposta.status === 403) {
        window.location.href = "/login";
        return;
    }
    if (!resposta.ok) {
        throw new Error("Nao foi possivel carregar o perfil");
    }
    perfilCarregado = await resposta.json();
    aplicarPerfilNaTela(perfilCarregado);
}

async function carregarHabilidadesUsuario() {
    const resposta = await fetch("/api/perfil/habilidades", { credentials: "include" });
    if (!resposta.ok) {
        throw new Error("Nao foi possivel carregar suas habilidades");
    }
    habilidadesUsuario = await resposta.json();
    syncSelecaoFromUsuario();
    renderHabilidadesView();
}

async function carregarTodasHabilidades() {
    const resposta = await fetch("/api/habilidades", { credentials: "include" });
    if (!resposta.ok) {
        throw new Error("Nao foi possivel carregar habilidades disponiveis");
    }
    todasHabilidades = await resposta.json();
}

async function salvarPerfil() {
    const resposta = await fetch("/api/usuarios/perfil", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nome:     nomeInput.value.trim(),
            email:    emailInput.value.trim(),
            ra:       raInput.value.trim(),
            bio:      bioInput ? bioInput.value.trim() : "",
            telefone: telefoneInput ? telefoneInput.value.trim() : "",
            github:   githubInput.value.trim(),
            linkedin: linkedinInput.value.trim()
        })
        
    });
    
    if (!resposta.ok) {
        const data = await resposta.json().catch(() => ({}));
        throw new Error(data.erro || "Erro ao salvar perfil");
    }
}

async function salvarHabilidades() {
    const resposta = await fetch("/api/perfil/habilidades", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habilidadeIds: [...habilidadesSelecionadas] })
    });

    console.log('status habilidades:', resposta.status)

    if (!resposta.ok) {
        const data = await resposta.json().catch(() => ({}));
        throw new Error(data.erro || "Nao foi possivel salvar habilidades");
    }
    habilidadesUsuario = await resposta.json();
    syncSelecaoFromUsuario();
    renderHabilidadesView();
}

if (fieldCards.length > 0) {
    fieldCards.forEach((card, index) => {
        window.setTimeout(() => {
            card.classList.add("animate-in");
        }, 90 * index);
    });
}

Promise.all([carregarPerfil(), carregarHabilidadesUsuario()]).catch((error) => {
    if (editFeedback) {
        editFeedback.textContent = error.message;
    }
});

if (perfilAvatarEl && fotoInput) {
    perfilAvatarEl.addEventListener("click", () => {
        fotoInput.click();
    });

    fotoInput.addEventListener("change", async () => {
        const file = fotoInput.files[0];
        if (!file) return;

        const maxSize = 3 * 1024 * 1024;
        if (file.size > maxSize) {
            if (typeof Swal !== "undefined") {
                Swal.fire({ icon: "error", title: "Arquivo muito grande", text: "Máximo 3MB." });
            } else if (editFeedback) {
                editFeedback.textContent = "Arquivo muito grande. Máximo 3MB.";
            }
            return;
        }

        perfilAvatarEl.classList.add("uploading");

        try {
            const formData = new FormData();
            formData.append("foto", file);

            const resposta = await fetch("/api/usuarios/perfil/foto", {
                method: "POST",
                credentials: "include",
                body: formData
            });

            const data = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(data.erro || "Erro ao fazer upload");
            }

            aplicarFoto(data.fotoUrl);

            if (editFeedback) {
                editFeedback.textContent = "Foto atualizada com sucesso.";
            }
        } catch (error) {
            if (typeof Swal !== "undefined") {
                Swal.fire({ icon: "error", title: "Erro no upload", text: error.message });
            } else if (editFeedback) {
                editFeedback.textContent = error.message;
            }
        } finally {
            perfilAvatarEl.classList.remove("uploading");
            fotoInput.value = "";
        }
    });
}

if (
    editButton &&
    saveButton &&
    cancelButton &&
    editFeedback &&
    perfilCard &&
    nomeView &&
    emailView &&
    raView &&
    nomeInput &&
    emailInput &&
    raInput &&
    habilidadesView &&
    habilidadesEdit &&
    githubView &&
    githubInput &&
    linkedinView &&
    linkedinInput
) {
    const syncInputsFromView = () => {
        nomeInput.value = nomeView.textContent.trim();
        emailInput.value = emailView.textContent.trim();
        raInput.value = raView.textContent.trim() === "—" ? "" : raView.textContent.trim();

        if (bioInput && bioView) {
            bioInput.value = bioView.textContent.trim();
        }

        if (telefoneInput && telefoneView) {
            telefoneInput.value = telefoneView.textContent.trim() === "—" ? "" : telefoneView.textContent.trim();
        }

        syncSocialUrlFromAnchor(githubView, githubInput);
        syncSocialUrlFromAnchor(linkedinView, linkedinInput);
        syncSelecaoFromUsuario();
        renderHabilidadesEdit();
    };

    const enterEditMode = async () => {
        try {
            await carregarTodasHabilidades();
            syncInputsFromView();
            perfilCard.classList.add("editing");
            editFeedback.textContent = "Modo de edicao ativado.";
            nomeInput.focus();
        } catch (error) {
            editFeedback.textContent = error.message;
        }
    };

    const exitEditMode = () => {
        perfilCard.classList.remove("editing");
    };

    editButton.addEventListener("click", () => {
        editButton.classList.add("is-active");
        enterEditMode();
        window.setTimeout(() => {
            editButton.classList.remove("is-active");
        }, 180);
    });

    saveButton.addEventListener("click", async () => {
        saveButton.disabled = true;
        try {
            console.log('iniciando save')
            console.log('github valor:', githubInput.value)
            console.log('linkedin valor:', linkedinInput.value)
            console.log('telefone valor:', telefoneInput.value)
            
            await salvarPerfil();
            console.log('salvarPerfil ok')
            
            await salvarHabilidades();
            console.log('salvarHabilidades ok')
    
            console.log('atualizando tela...')
            
            if (telefoneView && telefoneInput) {
                console.log('atualizando telefone:', telefoneInput.value)
                telefoneView.textContent = displayText(telefoneInput.value);
            }
    
            console.log('antes applySocial github:', githubInput.value)
            applySocialDisplay(githubView, githubInput.value);
            console.log('depois applySocial github — href:', githubView.href, 'text:', githubView.textContent)

            console.log('antes applySocial linkedin:', linkedinInput.value)
            applySocialDisplay(linkedinView, linkedinInput.value);
            console.log('depois applySocial linkedin — href:', linkedinView.href, 'text:', linkedinView.textContent)
    
            exitEditMode();
            editFeedback.textContent = "Perfil salvo com sucesso.";

            setTimeout(() => {
                window.location.reload()
            }, 800)
            
        } catch (error) {
            console.error('ERRO:', error)
            editFeedback.textContent = error.message;
        } finally {
            saveButton.disabled = false;
        }
    });
}