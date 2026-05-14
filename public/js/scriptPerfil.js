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
const habilidadesView = document.getElementById("perfilHabilidades");
const habilidadesInput = document.getElementById("perfilHabilidadesInput");
const githubView = document.getElementById("perfilGithubView");
const githubInput = document.getElementById("perfilGithubInput");
const linkedinView = document.getElementById("perfilLinkedinView");
const linkedinInput = document.getElementById("perfilLinkedinInput");
const avatarIniciais = document.getElementById("perfilAvatarIniciais");

function initialsFromNome(nome) {
    const parts = nome
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length === 0) {
        return "PF";
    }

    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }

    const first = parts[0][0] || "";
    const last = parts[parts.length - 1][0] || "";

    return (first + last).toUpperCase() || "PF";
}

function syncAvatarInitials() {
    if (!avatarIniciais || !nomeView) {
        return;
    }

    avatarIniciais.textContent = initialsFromNome(nomeView.textContent);
}

/** @param {HTMLAnchorElement} anchor */
function syncSocialUrlFromAnchor(anchor, inputEl) {
    if (!anchor || !inputEl) {
        return;
    }

    if (anchor.classList.contains("is-placeholder")) {
        inputEl.value = "";
        return;
    }

    inputEl.value = anchor.getAttribute("href") === "#" ? "" : anchor.getAttribute("href") || "";
}

/** @param {HTMLAnchorElement} anchor @param {string} raw */
function applySocialDisplay(anchor, raw) {
    if (!anchor) {
        return;
    }

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

if (fieldCards.length > 0) {
    fieldCards.forEach((card, index) => {
        window.setTimeout(() => {
            card.classList.add("animate-in");
        }, 90 * index);
    });
}

syncAvatarInitials();

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
    habilidadesInput &&
    githubView &&
    githubInput &&
    linkedinView &&
    linkedinInput
) {
    const syncInputsFromView = () => {
        nomeInput.value = nomeView.textContent.trim();
        emailInput.value = emailView.textContent.trim();
        raInput.value = raView.textContent.trim();
        habilidadesInput.value = habilidadesView.textContent.trim();
        syncSocialUrlFromAnchor(githubView, githubInput);
        syncSocialUrlFromAnchor(linkedinView, linkedinInput);
    };

    const enterEditMode = () => {
        syncInputsFromView();
        perfilCard.classList.add("editing");
        editFeedback.textContent = "Modo de edicao ativado.";
        nomeInput.focus();
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

    saveButton.addEventListener("click", () => {
        nomeView.textContent = nomeInput.value.trim() || "Nome do usuario";
        emailView.textContent = emailInput.value.trim() || "usuario@email.com";
        raView.textContent = raInput.value.trim() || "00000000";
        habilidadesView.textContent = habilidadesInput.value.trim() || "—";

        applySocialDisplay(githubView, githubInput.value);
        applySocialDisplay(linkedinView, linkedinInput.value);

        syncAvatarInitials();
        exitEditMode();
        editFeedback.textContent = "Dados atualizados no frontend.";
    });

    cancelButton.addEventListener("click", () => {
        exitEditMode();
        editFeedback.textContent = "Edicao cancelada.";
    });
}
